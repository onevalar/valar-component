import { DEFAULT_BASE_URL, type AgentSettings } from "./settings.js";

const STORAGE_KEY = "valar-agent-settings";

function load(): AgentSettings {
	const fallback: AgentSettings = {
		baseURL: DEFAULT_BASE_URL,
		apiKey: "",
		model: "",
		effort: "default",
		apiMode: "auto",
	};
	if (typeof localStorage === "undefined") return fallback;
	try {
		return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
	} catch {
		return fallback;
	}
}

export const agentSettings = $state<AgentSettings>(load());

export function saveAgentSettings() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(agentSettings)));
}

export function clearAgentSettings() {
	localStorage.removeItem(STORAGE_KEY);
	Object.assign(agentSettings, {
		baseURL: DEFAULT_BASE_URL,
		apiKey: "",
		model: "",
		effort: "default",
		apiMode: "auto",
	});
}
