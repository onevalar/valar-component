import type { AgentSettings } from "$lib/agent/settings.js";
import { checkBaseURL, resolveSettings } from "$lib/agent/settings.server.js";
import type { RequestHandler } from "./$types.js";

export const prerender = false;

/** Lists the model ids a service offers, so the reader can pick one instead of typing it. */
export const POST: RequestHandler = async ({ request }) => {
	const given = (await request.json().catch(() => ({}))) as Partial<AgentSettings>;
	const settings = resolveSettings(given);
	if (!settings.apiKey) return Response.json({ error: "请先填写 API Key" }, { status: 400 });

	try {
		const baseURL = checkBaseURL(settings.baseURL);
		const response = await fetch(`${baseURL}/models`, {
			headers: { authorization: `Bearer ${settings.apiKey}` },
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok)
			return Response.json({ error: `服务返回 ${response.status}` }, { status: 502 });
		const json = (await response.json()) as { data?: { id: string }[] };
		const models = (json.data ?? []).map((item) => item.id).sort();
		return Response.json({ models });
	} catch (error) {
		return Response.json({ error: (error as Error).message }, { status: 502 });
	}
};
