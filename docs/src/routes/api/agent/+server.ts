import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { ADVANCED_MODULES, ADVANCED_SCENES } from "$lib/advanced-catalog.js";
import type { AgentSettings } from "$lib/agent/settings.js";
import { checkBaseURL, resolveSettings } from "$lib/agent/settings.server.js";
import { createAgentTools } from "$lib/agent/tools.server.js";
import { uiCatalogIndex } from "$lib/agent/ui-catalog.js";
import { toLocale } from "$lib/i18n/config.js";
import { GLOBAL_RULES } from "../../../../../packages/cli/src/utils/design-rules-core.js";
import type { RequestHandler } from "./$types.js";

export const prerender = false;

const MAX_MESSAGES = 40;

const ADVANCED_SUMMARY = [
	"完整业务界面：",
	...ADVANCED_SCENES.map((s) => `- ${s.title.zh} (/advanced/${s.slug})：${s.description.zh}`),
	"核心业务模块：",
	...ADVANCED_MODULES.map((m) => `- ${m.title.zh} (/docs/components/${m.slug})：${m.description.zh}`),
].join("\n");

const SYSTEM = `你是 Valar Svelte 文档站里的助手：帮用户了解组件库全貌、选页面骨架与组件，并用库里的组件设计和拼装 Svelte 5 界面。站内信息均可通过工具查到，不要凭记忆编造。

工作方式：
1. 选骨架与组件：搭页面前先用 search_patterns / get_pattern 选定标准页面骨架，并按需用 get_skill 读取维护者定稿的设计方法（guides/page-composition.md、guides/copywriting.md、guides/motion.md）；选单组件先 search_components，再 get_component 读说明卡“何时用／何时不用”与 RULES.md。
2. 写界面：用法不确定时 read_doc（如 components/dialog）和 get_example，导入路径照文档写；只用库里已有组件，不手写相似控件。
3. 用户要“看看长什么样”“设计一个”“拼一个”界面时，用 show_ui 直接显示：先 get_ui_catalog 读用到的积木，再把树发给 show_ui；ok:false 按错误修改重发。严守克制品味：默认不写多余说明文字、不卡片套卡片、每个区域最多 1 个主按钮（variant=default）、不堆砌彩色标签。
4. 交付 Svelte 代码前必须调用 review_code 检查，修掉所有 error 再回答；如实说明仍存在的 warning。
5. 回答安装、命令、主题 token 等问题先 search_docs / read_doc 或 list_themes / get_theme。
6. 回答用中文，简短中性直接；提到组件时同时给中文名和代码名，如「组合框 <Combobox />」。

高级业务界面与模块（可推荐给用户在「高级组件」查看）：
${ADVANCED_SUMMARY}

show_ui 可用的积木：\n${uiCatalogIndex()}\n\n通用底线：\n${GLOBAL_RULES}`;

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as {
		messages?: UIMessage[];
		locale?: string;
		settings?: Partial<AgentSettings>;
	} | null;
	if (!body?.messages?.length || body.messages.length > MAX_MESSAGES) {
		return Response.json({ error: "bad_request" }, { status: 400 });
	}

	const locale = toLocale(body.locale);
	const settings = resolveSettings(body.settings);
	if (!settings.apiKey || !settings.model) {
		return Response.json(
			{ error: "请先在「模型配置」中填写 API Key 和模型名称。" },
			{ status: 400 }
		);
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
		tools: createAgentTools(locale),
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
