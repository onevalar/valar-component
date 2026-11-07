import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import type { AgentSettings } from "$lib/agent/settings.js";
import { checkBaseURL, resolveSettings } from "$lib/agent/settings.server.js";
import { createAgentTools } from "$lib/agent/tools.server.js";
import { uiCatalogIndex } from "$lib/agent/ui-catalog.js";
import { toLocale } from "$lib/i18n/config.js";
import { GLOBAL_RULES } from "../../../../../packages/cli/src/utils/design-rules-core.js";
import type { RequestHandler } from "./$types.js";

export const prerender = false;

const MAX_MESSAGES = 40;

const SYSTEM = `你是 Valar Svelte 文档站里的助手：帮用户查找组件、对比选型，用库里的组件设计和拼装 Svelte 5 界面，并回答站内文档的问题。站内所有信息都能通过工具查到，不要凭记忆回答。

工作方式：
1. 选组件：先 search_components（或 list_components），再 get_component 读说明卡和 RULES.md，看“何时用／何时不用”。
2. 写界面：用法不确定时 read_doc（如 components/dialog）和 get_example，导入路径照文档写。只用库里已有的组件，不要手写相似的组件。
3. 用户要“看看长什么样”“设计一个”“拼一个”界面时，用 show_ui 直接显示出来：先 get_ui_catalog 读用到的积木，再把树发给 show_ui；ok:false 就按错误修改重发。显示的界面里只能用下面这些积木，样式只能选它们提供的选项，没有 class 或 style。
   这些积木的设计约束已内置：输入控件都自带标签，间距和字号是固定档位。每个区域最多一个主按钮（variant=default）。
   用户也要代码时，再用 Svelte 代码回答，并调用 review_code。
4. 交付代码前必须调用 review_code 检查，修掉所有 error 再回答；如实说明仍存在的 warning。
5. 回答安装、命令行等问题：先 search_docs，再 read_doc；问主题色、设计 token：list_themes、get_theme。
6. 库里没有的能力直接说没有，不要编造。回答用中文，简短直接；提到组件时同时给中文名和代码名，如「组合框 <Combobox />」。

show_ui 可用的积木：\n${uiCatalogIndex()}\n\n通用设计规则（每个组件另有自己的 RULES.md，以 get_component 返回的为准）：
${GLOBAL_RULES}`;

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as {
		messages?: UIMessage[];
		locale?: string;
		settings?: Partial<AgentSettings>;
	} | null;
	if (!body?.messages?.length || body.messages.length > MAX_MESSAGES) {
		return Response.json({ error: "bad_request" }, { status: 400 });
	}

	const settings = resolveSettings(body.settings);
	if (!settings.apiKey || !settings.model) {
		return Response.json({ error: "not_configured" }, { status: 503 });
	}
	let baseURL: string;
	try {
		baseURL = checkBaseURL(settings.baseURL);
	} catch (error) {
		return Response.json({ error: (error as Error).message }, { status: 400 });
	}

	// OpenAI's own models take tools and reasoning together only through the Responses API, so use
	// it there; every other OpenAI-compatible service gets the widely supported chat completions.
	const useResponses =
		settings.apiMode === "responses" ||
		(settings.apiMode === "auto" && new URL(baseURL).hostname === "api.openai.com");
	const model = useResponses
		? createOpenAI({ baseURL, apiKey: settings.apiKey }).responses(settings.model)
		: createOpenAICompatible({ name: "agent", baseURL, apiKey: settings.apiKey }).chatModel(
				settings.model
			);
	const effort = settings.effort === "default" ? undefined : { reasoningEffort: settings.effort };

	const result = streamText({
		model,
		system: SYSTEM,
		messages: await convertToModelMessages(body.messages),
		stopWhen: stepCountIs(12),
		tools: createAgentTools(toLocale(body.locale)),
		onFinish: ({ finishReason, steps }) =>
			console.info("[agent] finished", finishReason, `${steps.length} steps`),
		providerOptions: effort
			? { openai: effort, openaiCompatible: effort, agent: effort }
			: undefined,
	});

	return result.toUIMessageStreamResponse({
		// Keep provider error text (wrong key, unknown model) so the panel can show the real reason.
		onError: (error) => {
			const message = error instanceof Error ? error.message : String(error);
			// Without the key, so the cause can be read from the server log.
			console.error(
				"[agent]",
				settings.model,
				useResponses ? "responses" : "chat",
				settings.effort,
				message
			);
			return message;
		},
	});
};
