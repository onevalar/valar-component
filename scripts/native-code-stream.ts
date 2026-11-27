// Appended to the standalone Shiki tokenizer in each native SDK.
export function createCodeStream<Line, State>(highlighter: {
	highlight(code: string, state?: State): { lines: Line[]; state?: State };
}) {
	let completed = "";
	let lines: Line[] = [];
	let state: State | undefined;
	return (source: string): (Line | string)[] => {
		const code = source.replace(/\n$/, "");
		if (!code.startsWith(completed)) {
			completed = "";
			lines = [];
			state = undefined;
		}
		const end = code.lastIndexOf("\n") + 1;
		if (end > completed.length) {
			const result = highlighter.highlight(code.slice(completed.length, end - 1), state);
			completed = code.slice(0, end);
			lines = [...lines, ...result.lines];
			state = result.state;
		}
		return [...lines, highlighter.highlight(code.slice(end), state).lines[0] ?? ""];
	};
}
