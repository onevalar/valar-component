/** Shared state so any button on the site can open the assistant, optionally with a question. */
export const agentPanel = $state<{ open: boolean; pending: string | null }>({
	open: false,
	pending: null,
});

export function askAgent(question?: string) {
	agentPanel.open = true;
	if (question?.trim()) agentPanel.pending = question.trim();
}
