<script lang="ts">
	import Code from "@lucide/svelte/icons/code-xml";
	import Copy from "@lucide/svelte/icons/copy";
	import Expand from "@lucide/svelte/icons/expand";
	import Eye from "@lucide/svelte/icons/eye";
	import Trash from "@lucide/svelte/icons/trash-2";
	import { tick } from "svelte";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import IssueSourcePreview from "./issue-source-preview.svelte";
	import type { IssueSourceKind } from "./rich-text.js";

	let {
		kind,
		source,
		chinese = false,
		portal,
		onSourceChange,
		onRemove,
	}: {
		kind: IssueSourceKind;
		source: string;
		chinese?: boolean;
		portal?: { to: string };
		onSourceChange?: (source: string) => void;
		onRemove?: () => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const title = $derived(kind === "diagram" ? text("图示", "Diagram") : text("公式", "Formula"));
	const label = $derived(
		kind === "diagram"
			? text("Mermaid 图示源码", "Mermaid diagram source")
			: text("LaTeX 公式源码", "LaTeX formula source")
	);
	const placeholder = $derived(
		kind === "diagram"
			? text("描述你的图示…", "Describe your diagram…")
			: text("输入 LaTeX 以插入公式", "Type LaTex to insert a formula")
	);
	const action =
		"size-[27px] rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1";
	let showPreview = $state(false);
	const preview = $derived(onSourceChange ? showPreview : true);
	let fullScreen = $state(false);
	let input = $state<HTMLTextAreaElement | null>(null);
	let fullScreenButton = $state<HTMLButtonElement | null>(null);
	let rendered = $state("");
	let feedback = $state("");
	const copyLabel = $derived(
		preview
			? kind === "diagram"
				? text("复制图示", "Copy diagram")
				: text("复制公式", "Copy formula")
			: text("复制源码", "Copy source")
	);

	async function togglePreview() {
		showPreview = !showPreview;
		if (!showPreview) {
			await tick();
			input?.focus({ preventScroll: true });
		}
	}

	async function copy() {
		try {
			if (preview && kind === "diagram") {
				await navigator.clipboard.write([
					new ClipboardItem({ "image/png": diagramImage(rendered) }),
				]);
			} else if (preview) {
				await navigator.clipboard.write([
					new ClipboardItem({
						"text/html": new Blob([rendered], { type: "text/html" }),
						"text/plain": new Blob([source], { type: "text/plain" }),
					}),
				]);
			} else {
				await navigator.clipboard.writeText(source);
			}
			feedback = text("已复制。", "Copied.");
		} catch {
			feedback = text("复制失败。", "Copy failed.");
		}
	}

	async function diagramImage(svg: string) {
		const decoded = new Image();
		decoded.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
		await decoded.decode();
		const canvas = document.createElement("canvas");
		canvas.width = decoded.naturalWidth;
		canvas.height = decoded.naturalHeight;
		const context = canvas.getContext("2d");
		if (!context) throw new Error("Canvas is unavailable");
		context.drawImage(decoded, 0, 0);
		return new Promise<Blob>((resolve, reject) =>
			canvas.toBlob((blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Unable to copy diagram"));
			})
		);
	}
</script>

{#snippet blockContent(expanded: boolean)}
	{#if preview}
		{#if expanded}
			<IssueSourcePreview {kind} {source} {chinese} onRender={(value) => (rendered = value)} />
		{:else}
			<ScrollArea.Root
				orientation="both"
				type="hover"
				viewportLabel={title}
				class="max-h-80 w-full [&>[data-slot=scroll-area-viewport]]:max-h-80"
			>
				<IssueSourcePreview {kind} {source} {chinese} onRender={(value) => (rendered = value)} />
			</ScrollArea.Root>
		{/if}
	{:else}
		<textarea
			bind:this={input}
			aria-label={label}
			{placeholder}
			value={source}
			oninput={(event) => onSourceChange?.(event.currentTarget.value)}
			rows="4"
			spellcheck="false"
			class="block [field-sizing:content] min-h-[120px] w-full resize-none rounded-[6px] bg-transparent p-4 font-mono text-[13px] leading-5 wrap-anywhere text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
		></textarea>
	{/if}
{/snippet}

<div
	data-slot="issue-source-block"
	data-kind={kind}
	class="my-2 min-w-0 rounded-[6px] bg-muted/50"
	contenteditable={onSourceChange ? "false" : undefined}
>
	<div class="flex justify-end px-1 pt-1">
		<div
			role="group"
			aria-label={`${title}${text("操作", " actions")}`}
			class="flex h-[31px] items-center rounded-full border border-border bg-popover p-0.5"
		>
			<Button
				variant="ghost"
				size="icon-xs"
				class={action}
				aria-label={copyLabel}
				title={copyLabel}
				disabled={!source.trim() || (preview && !rendered)}
				onclick={copy}
			>
				<Copy aria-hidden="true" size={14} />
			</Button>
			{#if onSourceChange}
				{@const viewLabel = preview
					? text("显示源码", "Show source")
					: kind === "diagram"
						? text("显示图示", "Show diagram")
						: text("显示公式", "Show formula")}
				<Button
					variant="ghost"
					size="icon-xs"
					class={action}
					aria-label={viewLabel}
					title={viewLabel}
					disabled={!preview && !source.trim()}
					onclick={togglePreview}
				>
					{#if preview}<Code aria-hidden="true" size={14} />{:else}<Eye
							aria-hidden="true"
							size={14}
						/>{/if}
				</Button>
			{/if}
			<Button
				bind:ref={fullScreenButton}
				variant="ghost"
				size="icon-xs"
				class={action}
				aria-label={text("全屏", "Full screen")}
				title={text("全屏", "Full screen")}
				onclick={() => (fullScreen = true)}
			>
				<Expand aria-hidden="true" size={14} />
			</Button>
			{#if onRemove}
				<Button
					variant="ghost"
					size="icon-xs"
					class={action}
					aria-label={text("删除", "Delete")}
					title={text("删除", "Delete")}
					onclick={onRemove}
				>
					<Trash aria-hidden="true" size={14} />
				</Button>
			{/if}
		</div>
	</div>
	{#if !fullScreen}{@render blockContent(false)}{/if}
	<span class="sr-only" role="status">{feedback}</span>
</div>

<Dialog.Root bind:open={fullScreen}>
	<Dialog.Content
		portalProps={portal}
		closeLabel={text("关闭全屏", "Close full screen")}
		class="flex h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-3 p-4 sm:max-w-none"
		onCloseAutoFocus={async (event) => {
			event.preventDefault();
			await tick();
			fullScreenButton?.focus({ preventScroll: true });
		}}
	>
		<Dialog.Title>{title}</Dialog.Title>
		<Dialog.Description class="sr-only"
			>{text("全屏查看内容", "View the block in full screen")}</Dialog.Description
		>
		<ScrollArea.Root orientation="both" type="hover" class="min-h-0 flex-1" viewportLabel={title}>
			{@render blockContent(true)}
		</ScrollArea.Root>
	</Dialog.Content>
</Dialog.Root>
