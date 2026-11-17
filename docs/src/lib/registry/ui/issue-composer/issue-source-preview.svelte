<script lang="ts">
	import { renderIssueDiagram } from "./issue-diagram.js";
	import type { IssueSourceKind } from "./rich-text.js";

	let {
		kind,
		source,
		chinese = false,
		onRender,
	}: {
		kind: IssueSourceKind;
		source: string;
		chinese?: boolean;
		onRender?: (rendered: string) => void;
	} = $props();

	let host = $state<HTMLDivElement>();
	let rendered = $state("");
	let failed = $state(false);
	let dark = $state(false);
	const id = $props.id();
	const text = (zh: string, en: string) => (chinese ? zh : en);

	$effect(() => {
		if (kind !== "diagram" || !host) return;
		function measure() {
			if (host) dark = getComputedStyle(host).colorScheme === "dark" || !!host.closest(".dark");
		}
		measure();
		const observer = new MutationObserver(measure);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "style"],
		});
		return () => observer.disconnect();
	});

	$effect(() => {
		const expression = source.trim();
		rendered = "";
		failed = false;
		onRender?.("");
		if (!expression) return;
		const compute =
			kind === "diagram"
				? renderIssueDiagram(expression, `${id}-diagram`, dark)
				: import("katex").then(({ default: katex }) =>
						katex.renderToString(expression, { displayMode: true, output: "mathml", trust: false })
					);
		let current = true;
		void compute.then(
			(value) => {
				if (!current) return;
				rendered = value;
				onRender?.(value);
			},
			() => {
				if (current) failed = true;
			}
		);
		return () => {
			current = false;
		};
	});
</script>

<div
	bind:this={host}
	class="grid min-h-[120px] min-w-max place-items-center p-4 text-center"
	aria-busy={Boolean(source.trim() && !rendered && !failed)}
>
	{#if failed}
		<p role="status" class="max-w-xs text-[13px] wrap-anywhere text-destructive">
			{kind === "diagram"
				? text(
						"无法解析图示，请检查 Mermaid 语法。",
						"Unable to render the diagram. Check the Mermaid syntax."
					)
				: text(
						"无法解析公式，请检查 LaTeX 语法。",
						"Unable to render the formula. Check the LaTeX syntax."
					)}
		</p>
	{:else if rendered}
		{#if kind === "diagram"}
			<img
				class="max-w-none"
				src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered)}`}
				alt={text("Mermaid 图示", "Mermaid diagram")}
			/>
		{:else}
			<!-- KaTeX serializes escaped MathML with trust disabled. -->
			{@html rendered}
		{/if}
	{:else if source.trim()}
		<p role="status" class="text-[13px] text-muted-foreground">{text("正在渲染…", "Rendering…")}</p>
	{/if}
</div>
