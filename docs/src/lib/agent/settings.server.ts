import { env } from "$env/dynamic/private";
import { API_MODES, DEFAULT_BASE_URL, EFFORTS, type AgentSettings } from "./settings.js";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const PRIVATE_IP = /^(0\.|10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;

/**
 * The server calls whatever address the reader typed, so keep it to public HTTPS services
 * (plain HTTP only for a model running on this machine). Throws a message fit to show the reader.
 */
export function checkBaseURL(value: string): string {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		throw new Error("Base URL 不是有效的网址");
	}
	const local = LOCAL_HOSTS.has(url.hostname);
	if (url.protocol === "http:" && !local)
		throw new Error("Base URL 必须使用 https（本机模型可用 http://localhost）");
	if (url.protocol !== "https:" && url.protocol !== "http:")
		throw new Error("Base URL 必须以 https:// 开头");
	if (url.protocol === "https:" && (local || PRIVATE_IP.test(url.hostname))) {
		throw new Error("Base URL 不能指向内网地址");
	}
	return value.replace(/\/+$/, "");
}

/** The reader's settings first, then the optional defaults in `docs/.env.local`. */
export function resolveSettings(
	given?: Partial<AgentSettings>
): AgentSettings & { fromReader: boolean } {
	const effort = given?.effort || env.AGENT_EFFORT || "default";
	return {
		baseURL: given?.baseURL || env.AGENT_BASE_URL || DEFAULT_BASE_URL,
		apiKey: given?.apiKey || env.AGENT_API_KEY || "",
		model: given?.model || env.AGENT_MODEL || "",
		effort: EFFORTS.some((item) => item.value === effort)
			? (effort as AgentSettings["effort"])
			: "default",
		apiMode: API_MODES.some((item) => item.value === given?.apiMode)
			? (given?.apiMode as AgentSettings["apiMode"])
			: "auto",
		fromReader: Boolean(given?.apiKey),
	};
}
