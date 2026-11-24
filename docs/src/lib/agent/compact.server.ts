import type { UIMessage } from "ai";

const HEAVY_OUTPUT_CHARS = 400;
const DEFAULT_MAX_WINDOW = 32;
const DEFAULT_RECENT_TURNS = 2;

const COMPACTABLE_TOOLS = new Set([
	"tool-read_doc",
	"tool-get_component",
	"tool-get_pattern",
	"tool-get_skill",
	"tool-get_ui_catalog",
	"tool-search_components",
	"tool-search_patterns",
	"tool-search_docs",
	"tool-review_code",
	// Legacy names from older persisted sessions
	"tool-list_components",
	"tool-get_example",
	"tool-list_themes",
	"tool-get_theme",
]);

function summarizeToolOutput(type: string, input: unknown): string {
	const args = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
	const arg = (key: string) => (typeof args[key] === "string" ? args[key] : "");
	switch (type) {
		case "tool-read_doc": {
			const target = arg("path") || arg("example") || arg("theme");
			return `[已省略较早轮次的文档/示例正文${target ? `（${target}）` : ""}，如需细节可重新调用 read_doc]`;
		}
		case "tool-get_component":
			return `[已省略较早轮次的组件说明卡${arg("name") ? `（${arg("name")}）` : ""}，如需细节可重新调用 get_component]`;
		case "tool-get_pattern":
			return `[已省略较早轮次的页面骨架全文${arg("name") ? `（${arg("name")}）` : ""}，如需细节可重新调用 get_pattern]`;
		case "tool-get_skill":
			return `[已省略较早轮次的设计规范正文${arg("file") ? `（${arg("file")}）` : ""}，如需细节可重新调用 get_skill]`;
		case "tool-get_ui_catalog":
			return "[已省略较早轮次的积木目录与属性说明，画界面前可重新调用 get_ui_catalog]";
		case "tool-search_components":
		case "tool-list_components":
			return "[已省略较早轮次的组件列表结果，如需核对可重新调用 search_components]";
		case "tool-search_patterns":
			return "[已省略较早轮次的页面骨架列表，如需核对可重新调用 search_patterns]";
		case "tool-search_docs":
			return "[已省略较早轮次的文档检索结果，如需核对可重新调用 search_docs]";
		case "tool-review_code":
			return "[已省略较早轮次的代码质检详情]";
		default:
			return "[已省略较早轮次的工具返回，如需完整内容可重新查询]";
	}
}

function outputSize(output: unknown): number {
	if (typeof output === "string") return output.length;
	try {
		return JSON.stringify(output).length;
	} catch {
		return HEAVY_OUTPUT_CHARS + 1;
	}
}

/**
 * Keeps multi-turn conversations fast and within context limits:
 * - Preserves recent user/assistant turns verbatim so follow-up edits see full details.
 * - Compacts bulky tool outputs and stale reasoning blocks in earlier turns.
 * - Slides the message window on very long threads instead of rejecting with HTTP 400.
 */
export function compactMessages(
	messages: UIMessage[],
	options: { maxWindow?: number; keepRecentTurns?: number } = {}
): UIMessage[] {
	const maxWindow = options.maxWindow ?? DEFAULT_MAX_WINDOW;
	const keepRecentTurns = options.keepRecentTurns ?? DEFAULT_RECENT_TURNS;

	// Trim very long conversations starting on a user turn so message alternation stays valid.
	let windowed = messages;
	if (windowed.length > maxWindow) {
		const start = windowed.length - maxWindow;
		const firstUser = windowed.findIndex((msg, idx) => idx >= start && msg.role === "user");
		windowed = windowed.slice(firstUser >= 0 ? firstUser : start);
	}

	// Locate the boundary of the most recent N user turns to preserve untouched.
	let userTurnsSeen = 0;
	let recentStart = 0;
	for (let i = windowed.length - 1; i >= 0; i--) {
		if (windowed[i]?.role === "user") {
			userTurnsSeen++;
			if (userTurnsSeen >= keepRecentTurns) {
				recentStart = i;
				break;
			}
		}
	}

	return windowed.map((message, index) => {
		if (index >= recentStart || message.role !== "assistant") return message;

		const nextParts: UIMessage["parts"] = [];
		for (const part of message.parts) {
			if (part.type === "reasoning") continue;
			if (
				COMPACTABLE_TOOLS.has(part.type) &&
				"state" in part &&
				part.state === "output-available" &&
				"output" in part &&
				outputSize(part.output) > HEAVY_OUTPUT_CHARS
			) {
				nextParts.push({
					...part,
					output: summarizeToolOutput(part.type, "input" in part ? part.input : undefined),
				} as UIMessage["parts"][number]);
				continue;
			}
			nextParts.push(part);
		}

		return {
			...message,
			parts: nextParts.length ? nextParts : message.parts.filter((p) => p.type !== "reasoning"),
		};
	});
}
