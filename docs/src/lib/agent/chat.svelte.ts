import { page } from "$app/state";
import { Chat } from "@ai-sdk/svelte";
import { DefaultChatTransport, type UIMessage } from "ai";
import { agentSettings } from "./settings.svelte.js";

const STORAGE_KEY = "valar-agent-chat";

/** The conversation survives a page reload (this tab only), so an answer is not lost to one. */
function restore(): UIMessage[] {
	if (typeof sessionStorage === "undefined") return [];
	try {
		return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
	} catch {
		return [];
	}
}

/**
 * The one conversation of the site. The home page and the side panel on every other page both
 * show it, so a question started on one is still there on the other.
 */
export const agentChat = new Chat({
	messages: restore(),
	transport: new DefaultChatTransport({
		api: "/api/agent",
		body: () => ({ locale: page.data.locale ?? "en", settings: $state.snapshot(agentSettings) }),
	}),
});

if (typeof sessionStorage !== "undefined") {
	$effect.root(() => {
		$effect(() => {
			const messages = $state.snapshot(agentChat.messages);
			const idle = agentChat.status === "ready" || agentChat.status === "error";
			if (!idle) return;
			try {
				if (messages.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
				else sessionStorage.removeItem(STORAGE_KEY);
			} catch {
				// Storage may be full or unavailable; the conversation just won't survive a reload.
			}
		});
	});
}
