/** Model settings the reader can change in the assistant panel. Stored in this browser only. */
export const EFFORTS = [
	{ value: "default", label: "默认" },
	{ value: "none", label: "关闭" },
	{ value: "low", label: "低" },
	{ value: "medium", label: "中" },
	{ value: "high", label: "高" },
] as const;

export const API_MODES = [
	{ value: "auto", label: "自动" },
	{ value: "responses", label: "Responses" },
	{ value: "chat", label: "Chat Completions" },
] as const;

export type ApiMode = (typeof API_MODES)[number]["value"];

export type Effort = (typeof EFFORTS)[number]["value"];

export type AgentSettings = {
	baseURL: string;
	apiKey: string;
	model: string;
	effort: Effort;
	/** Which OpenAI interface to call; "auto" uses Responses only for api.openai.com. */
	apiMode: ApiMode;
};

export const DEFAULT_BASE_URL = "https://api.openai.com/v1";
