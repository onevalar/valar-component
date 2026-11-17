let pending: Promise<unknown> = Promise.resolve();

export function renderIssueDiagram(source: string, id: string, dark: boolean): Promise<string> {
	const render = pending.then(async () => {
		const { default: mermaid } = await import("mermaid");
		mermaid.initialize({
			startOnLoad: false,
			securityLevel: "strict",
			theme: dark ? "dark" : "neutral",
			htmlLabels: false,
			suppressErrorRendering: true,
		});
		const result = await mermaid.render(id, source);
		return result.svg;
	});
	pending = render.catch(() => {});
	return render;
}
