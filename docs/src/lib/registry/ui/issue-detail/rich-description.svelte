<script lang="ts">
	import { richTextClass, safeIssueLink } from "./model.js";
	import type { JSONContent } from "@tiptap/core";

	let { content, slot = "issue-description" }: { content: JSONContent; slot?: string } = $props();

	const elements = {
		paragraph: "p",
		bulletList: "ul",
		orderedList: "ol",
		listItem: "li",
		blockquote: "blockquote",
	} as const;
	const marks = {
		bold: "strong",
		italic: "em",
		underline: "u",
		strike: "s",
		code: "code",
	} as const;
</script>

{#snippet marked(value: string, styles: NonNullable<JSONContent["marks"]>, index: number)}
	{@const mark = styles[index]}
	{#if !mark}{value}
	{:else if mark.type === "link"}
		{@const href = safeIssueLink(mark.attrs?.href)}
		{#if href}<a {href}>{@render marked(value, styles, index + 1)}</a>
		{:else}{@render marked(value, styles, index + 1)}{/if}
	{:else if Object.hasOwn(marks, mark.type)}
		<svelte:element this={marks[mark.type as keyof typeof marks]}
			>{@render marked(value, styles, index + 1)}</svelte:element
		>
	{:else}
		{@render marked(value, styles, index + 1)}
	{/if}
{/snippet}

{#snippet children(node: JSONContent)}
	{#each node.content ?? [] as child}{@render renderNode(child)}{/each}
{/snippet}

{#snippet renderNode(node: JSONContent)}
	{#if node.type === "text"}
		{@render marked(node.text ?? "", node.marks ?? [], 0)}
	{:else if node.type === "hardBreak"}
		<br />
	{:else if node.type === "horizontalRule"}
		<hr />
	{:else if node.type === "codeBlock"}
		<pre><code>{@render children(node)}</code></pre>
	{:else if node.type === "heading"}
		{@const heading = node.attrs?.level === 4 ? "h4" : "h3"}
		<svelte:element this={heading}>{@render children(node)}</svelte:element>
	{:else if node.type === "orderedList"}
		<ol start={Number.isSafeInteger(node.attrs?.start) ? node.attrs?.start : undefined}>
			{@render children(node)}
		</ol>
	{:else if node.type && Object.hasOwn(elements, node.type)}
		<svelte:element this={elements[node.type as keyof typeof elements]}>
			{#if node.type === "paragraph" && !node.content?.length}<br />{:else}{@render children(
					node
				)}{/if}
		</svelte:element>
	{:else}
		{@render children(node)}
	{/if}
{/snippet}

<div class={richTextClass} data-slot={slot}>
	{@render renderNode(content)}
</div>
