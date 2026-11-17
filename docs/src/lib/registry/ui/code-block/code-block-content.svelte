<script lang="ts">
	import { Root as ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import CodeBlockLine from "./code-block-line.svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		viewportRef = $bindable(null),
		class: className,
		style,
		"aria-label": viewportLabel = "代码",
		tabindex = 0,
		code,
		wrap = false,
		scrollOrientation,
		lineNumbers = false,
		startLine = 1,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLPreElement>> & {
		/** Plain text to render. Split into lines when `lineNumbers` is set. */
		code?: string;
		wrap?: boolean;
		/** Restricts an axis when the surrounding UI clips rather than scrolls it. */
		scrollOrientation?: "horizontal" | "vertical" | "both";
		viewportRef?: HTMLElement | null;
		lineNumbers?: boolean;
		startLine?: number;
	} = $props();

	// A `code` string is split into lines so each one can be numbered.
	const lines = $derived(
		code !== undefined && lineNumbers ? code.replace(/\n$/, "").split("\n") : null
	);
</script>

{#snippet content()}
	<code
		data-slot="code-block-code"
		class="cn-code-block-code grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0"
	>
		{#if lines}
			{#each lines as line, index (index)}
				<CodeBlockLine code={line} />
			{/each}
		{:else if code !== undefined}
			{code}
		{:else}
			{@render children?.()}
		{/if}
	</code>
{/snippet}

<!-- Whitespace inside a <pre> is rendered, so its content is a snippet defined outside it, where Svelte trims whitespace as usual. -->
<ScrollArea
	bind:viewportRef
	data-code-block-scroll-area=""
	dir="ltr"
	type="hover"
	orientation={scrollOrientation ?? (wrap ? "vertical" : "both")}
	viewportLabel={viewportLabel ?? undefined}
	viewportProps={{
		tabindex,
		style,
		"data-wrap": wrap || undefined,
		class: cn(
			"cn-code-block-content scroll-fade-x h-auto min-h-0 min-w-0 text-start font-mono data-wrap:scroll-fade-y data-wrap:wrap-anywhere",
			className
		),
	}}
>
	<pre
		bind:this={ref}
		data-slot="code-block-content"
		data-wrap={wrap || undefined}
		data-numbered={lineNumbers || undefined}
		dir="ltr"
		style:counter-reset="line {startLine - 1}"
		class="m-0 min-w-0 [font:inherit] data-wrap:whitespace-pre-wrap"
		{...restProps}>{@render content()}</pre>
</ScrollArea>
