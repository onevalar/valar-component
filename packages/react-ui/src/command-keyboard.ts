// Some browsers expose only keyCode 229 or composition events during IME keydown.
export const composingCommandInputs = new WeakSet<EventTarget>();

export function isCommandComposing(event: KeyboardEvent) {
	return (
		event.isComposing ||
		event.keyCode === 229 ||
		(event.target !== null && composingCommandInputs.has(event.target))
	);
}
