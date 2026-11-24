import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { compactMessages } from "$lib/agent/compact.server.js";
import type { AgentSettings } from "$lib/agent/settings.js";
import { checkBaseURL, resolveSettings } from "$lib/agent/settings.server.js";
import { AGENT_SYSTEM_PROMPT, createAgentTools } from "$lib/agent/tools.server.js";
import { toLocale } from "$lib/i18n/config.js";
import type { RequestHandler } from "./$types.js";

export const prerender = false;

const MAX_INCOMING_MESSAGES = 120;

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as {
		messages?: UIMessage[];
		locale?: string;
		settings?: Partial<AgentSettings>;
	} | null;
	if (!body?.messages?.length || body.messages.length > MAX_INCOMING_MESSAGES) {
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
		system: AGENT_SYSTEM_PROMPT,
		messages: await convertToModelMessages(compactMessages(body.messages)),
		stopWhen: stepCountIs(16),
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
