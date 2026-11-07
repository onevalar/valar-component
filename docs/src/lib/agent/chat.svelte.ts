import { page } from "$app/state";
import { Chat } from "@ai-sdk/svelte";
import { DefaultChatTransport, type UIMessage } from "ai";
import { untrack } from "svelte";
import { agentSettings } from "./settings.svelte.js";

const STORAGE_KEY = "valar-agent-conversations";
const MAX_CONVERSATIONS = 30;

export type Conversation = {
	id: string;
	title: string;
	updatedAt: number;
	messages: UIMessage[];
};

type Saved = { currentId: string; conversations: Conversation[] };

function load(): Saved {
	const empty = { currentId: crypto.randomUUID(), conversations: [] };
	if (typeof localStorage === "undefined") return empty;
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Saved | null;
		if (!saved?.conversations) return empty;
		const current = saved.conversations.some((item) => item.id === saved.currentId);
		return { ...saved, currentId: current ? saved.currentId : empty.currentId };
	} catch {
		return empty;
	}
}

const saved = load();

/**
 * The assistant's conversation and the history behind it. Conversations are kept in this browser
 * only; nothing is sent anywhere except the question being asked.
 */
export const agentChat = new Chat({
	messages: saved.conversations.find((item) => item.id === saved.currentId)?.messages ?? [],
	transport: new DefaultChatTransport({
		api: "/api/agent",
		body: () => ({ locale: page.data.locale ?? "en", settings: $state.snapshot(agentSettings) }),
	}),
});

export const agentHistory = $state<Saved>(saved);

/** Newest first, as the history list shows them. */
export function recentConversations(): Conversation[] {
	return [...agentHistory.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
}

function titleOf(messages: UIMessage[]): string {
	const first = messages.find((message) => message.role === "user");
	const text = first?.parts.map((part) => (part.type === "text" ? part.text : "")).join("") ?? "";
	const line = text.trim().replace(/\s+/g, " ");
	return line.length > 28 ? `${line.slice(0, 28)}…` : line || "新对话";
}

function reset(id: string, messages: UIMessage[]) {
	void agentChat.stop();
	agentChat.clearError();
	agentHistory.currentId = id;
	agentChat.messages = messages;
}

/** A blank conversation. The one being left stays in the history. */
export function newConversation() {
	if (!agentChat.messages.length) return;
	reset(crypto.randomUUID(), []);
}

export function openConversation(id: string) {
	const target = agentHistory.conversations.find((item) => item.id === id);
	if (target && id !== agentHistory.currentId)
		reset(id, $state.snapshot(target.messages) as UIMessage[]);
}

export function deleteConversation(id: string) {
	agentHistory.conversations = agentHistory.conversations.filter((item) => item.id !== id);
	if (id === agentHistory.currentId) reset(crypto.randomUUID(), []);
}

export function clearHistory() {
	agentHistory.conversations = [];
	reset(crypto.randomUUID(), []);
}

if (typeof localStorage !== "undefined") {
	$effect.root(() => {
		// Keep the open conversation in the history once its answer has finished, so a reload or
		// a stopped answer never loses it.
		$effect(() => {
			const messages = $state.snapshot(agentChat.messages) as UIMessage[];
			if (agentChat.status !== "ready" && agentChat.status !== "error") return;
			if (!messages.length) return;
			untrack(() => {
				const id = agentHistory.currentId;
				const existing = agentHistory.conversations.find((item) => item.id === id);
				// Opening an old conversation must not move it to the top; only new messages do.
				if (existing && JSON.stringify(existing.messages) === JSON.stringify(messages)) return;
				const entry = { id, title: titleOf(messages), updatedAt: Date.now(), messages };
				const others = agentHistory.conversations.filter((item) => item.id !== id);
				agentHistory.conversations = [entry, ...others].slice(0, MAX_CONVERSATIONS);
			});
		});
		$effect(() => {
			const snapshot = $state.snapshot(agentHistory);
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
			} catch {
				// Storage may be full or unavailable; the history just won't survive a reload.
			}
		});
	});
}
