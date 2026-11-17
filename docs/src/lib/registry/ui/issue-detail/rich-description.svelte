<script lang="ts">
	import * as Accordion from "$lib/registry/ui/accordion/index.js";
	import * as CodeBlock from "$lib/registry/ui/code-block/index.js";
	import {
		IssueMediaBlock,
		IssueSourceBlock,
		richTextClass,
		safeIssueLink,
		type IssueInlineMedia,
	} from "$lib/registry/ui/issue-composer/index.js";
	import type { JSONContent } from "@tiptap/core";

	let {
		content,
		slot = "issue-description",
		chinese = false,
		inlineMedia = [],
		portal,
	}: {
		content: JSONContent;
		slot?: string;
		chinese?: boolean;
		inlineMedia?: readonly IssueInlineMedia[];
		portal?: { to: string };
	} = $props();

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
		{@const code =
			node.content
				?.map((child) => child.text ?? (child.type === "hardBreak" ? "\n" : ""))
				.join("") ?? ""}
		<CodeBlock.Root appearance="issue" class="my-2 [&_pre]:m-0 [&_pre]:bg-transparent">
			<CodeBlock.Content {code} lineNumbers aria-label={chinese ? "代码内容" : "Code content"} />
		</CodeBlock.Root>
	{:else if node.type === "heading"}
		{@const heading = node.attrs?.level === 2 || node.attrs?.level === 4 ? "h4" : "h3"}
		<svelte:element this={heading}>{@render children(node)}</svelte:element>
	{:else if node.type === "orderedList"}
		<ol start={Number.isSafeInteger(node.attrs?.start) ? node.attrs?.start : undefined}>
			{@render children(node)}
		</ol>
	{:else if node.type === "taskList"}
		<ul data-type="taskList">{@render children(node)}</ul>
	{:else if node.type === "taskItem"}
		{@const checked = node.attrs?.checked === true}
		<li data-type="taskItem" data-checked={checked}>
			<label>
				<input
					type="checkbox"
					{checked}
					disabled
					aria-label={chinese ? "任务完成" : "Task completed"}
				/>
			</label>
			<div>{@render children(node)}</div>
		</li>
	{:else if node.type === "issueSection"}
		{@const [heading, ...body] = node.content ?? []}
		<Accordion.Root
			type="single"
			value={node.attrs?.open === false ? "" : "section"}
			appearance="section"
		>
			<Accordion.Item value="section">
				<Accordion.Trigger>
					{#if heading?.content?.length}{@render children(heading)}{:else}{chinese
							? "未命名区块"
							: "Untitled section"}{/if}
				</Accordion.Trigger>
				<Accordion.Content
					>{#each body as item}{@render renderNode(item)}{/each}</Accordion.Content
				>
			</Accordion.Item>
		</Accordion.Root>
	{:else if node.type === "issueDiagram" || node.type === "issueFormula"}
		<IssueSourceBlock
			kind={node.type === "issueDiagram" ? "diagram" : "formula"}
			source={String(node.attrs?.source ?? "")}
			{chinese}
			{portal}
		/>
	{:else if node.type === "issueMedia"}
		<IssueMediaBlock
			name={String(node.attrs?.name ?? "")}
			mime={String(node.attrs?.mime ?? "")}
			src={node.attrs?.src}
			crop={node.attrs?.crop}
			media={inlineMedia.find(({ id }) => id === node.attrs?.id)}
			{chinese}
			{portal}
		/>
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
