<script lang="ts">
	import { Plugin, PluginKey } from "@tiptap/pm/state";
	import { Decoration, DecorationSet } from "@tiptap/pm/view";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import CommentComposer from "./comment-composer.svelte";
	import type { IssueCommentDraft } from "./activity-model.js";
	import type { Editor } from "@tiptap/core";

	type Selection = { from: number; to: number; text: string };

	let {
		editor,
		chinese,
		portal,
		onPost,
	}: {
		editor: Editor;
		chinese: boolean;
		portal: { to: string };
		onPost: (draft: IssueCommentDraft) => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const marks = [
		{ name: "bold", label: ["粗体", "Bold"], glyph: "B", class: "font-bold" },
		{ name: "italic", label: ["斜体", "Italic"], glyph: "I", class: "italic" },
		{ name: "strike", label: ["删除线", "Strikethrough"], glyph: "S", class: "line-through" },
		{ name: "underline", label: ["下划线", "Underline"], glyph: "U", class: "underline" },
		{ name: "code", label: ["行内代码", "Inline code"], glyph: "<>", class: "font-mono" },
	] as const;
	const buttonStyle = "size-[26px] shrink-0 rounded-[4px] p-0 text-xs";
	const highlightKey = new PluginKey("issue-description-comment");
	let selected = $state.raw<Selection | null>(null);
	let draftSelection = $state.raw<Selection | null>(null);
	let toolsOpen = $state(false);
	let toolBase = $state<HTMLDivElement | null>(null);

	const anchor = $derived.by(() => {
		const selection = draftSelection ?? selected;
		if (!selection) return null;
		return {
			contextElement: editor.view.dom,
			getBoundingClientRect() {
				const start = editor.view.coordsAtPos(selection.from);
				const end = editor.view.coordsAtPos(selection.to);
				// Take the first line as the anchor for a multi-line selection.
				const right = end.top === start.top ? end.right : start.right;
				const x = Math.min(start.left, right);
				return new DOMRect(x, start.top, Math.abs(right - start.left), start.bottom - start.top);
			},
		};
	});

	const toolPosition = $derived.by(() => {
		if (!toolsOpen || !anchor || !toolBase) return null;
		const selectedBounds = anchor.getBoundingClientRect();
		const baseBounds = toolBase.getBoundingClientRect();
		return {
			left: selectedBounds.left - baseBounds.left,
			top:
				(selectedBounds.top >= 88 ? selectedBounds.top - 38 : selectedBounds.bottom + 4) -
				baseBounds.top,
		};
	});

	$effect(() => {
		const active = editor;
		function sync() {
			const { from, to, empty } = active.state.selection;
			const quote = !empty ? active.state.doc.textBetween(from, to, "\n").trim() : "";
			selected = quote ? { from, to, text: quote } : null;
			if (!draftSelection) toolsOpen = !!selected;
		}
		active.on("selectionUpdate", sync);
		active.on("update", sync);
		return () => {
			active.off("selectionUpdate", sync);
			active.off("update", sync);
		};
	});

	$effect(() => {
		const quote = draftSelection;
		const active = editor;
		if (!quote) return;
		active.registerPlugin(
			new Plugin({
				key: highlightKey,
				props: {
					decorations(state) {
						return quote.to <= state.doc.content.size
							? DecorationSet.create(state.doc, [
									Decoration.inline(quote.from, quote.to, {
										class: "bg-(--detail-accent)/20",
										"data-slot": "issue-description-comment-highlight",
									}),
								])
							: null;
					},
				},
			})
		);
		return () => {
			if (!active.isDestroyed) active.unregisterPlugin(highlightKey);
		};
	});

	function currentSelection() {
		const view = editor.view;
		const range = view.dom.ownerDocument.getSelection();
		// An immediately activated toolbar can precede ProseMirror's selectionUpdate.
		if (
			range &&
			!range.isCollapsed &&
			range.anchorNode &&
			range.focusNode &&
			view.dom.contains(range.anchorNode) &&
			view.dom.contains(range.focusNode)
		) {
			const start = view.posAtDOM(range.anchorNode, range.anchorOffset);
			const end = view.posAtDOM(range.focusNode, range.focusOffset);
			const from = Math.min(start, end);
			const to = Math.max(start, end);
			const text = view.state.doc.textBetween(from, to, "\n").trim();
			if (text) return { from, to, text };
		}
		return selected;
	}

	function formatSelection(mark: string) {
		const range = currentSelection();
		if (!range) return;
		editor
			.chain()
			.setTextSelection({ from: range.from, to: range.to })
			.focus()
			.toggleMark(mark)
			.run();
	}

	function startComment() {
		const quote = currentSelection();
		if (!quote) return;
		draftSelection = quote;
		toolsOpen = false;
	}

	function closeComment() {
		const quote = draftSelection;
		draftSelection = null;
		toolsOpen = false;
		if (quote) editor.chain().setTextSelection(quote.to).focus().run();
	}

	function post(draft: IssueCommentDraft) {
		if (!draftSelection) return;
		onPost({ ...draft, descriptionExcerpt: draftSelection.text });
		closeComment();
	}

	function dismissOutside(event: MouseEvent) {
		if (!toolsOpen || !(event.target instanceof Node)) return;
		if (editor.view.dom.contains(event.target) || toolBase?.contains(event.target)) return;
		toolsOpen = false;
	}

	function dismissFromButton(event: KeyboardEvent) {
		if (event.key !== "Escape") return;
		event.preventDefault();
		event.stopPropagation();
		toolsOpen = false;
		editor.commands.focus();
	}
</script>

<svelte:document onclick={dismissOutside} />

<div bind:this={toolBase} class="relative min-w-0">
	{#if toolPosition}
		<div
			data-slot="issue-description-selection-actions"
			role="group"
			aria-label={text("选中文本操作", "Selected text actions")}
			class="absolute z-20 flex h-[34px] w-max items-center rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-border"
			style:left={`clamp(0px, ${toolPosition.left}px, max(0px, calc(100% - 164px)))`}
			style:top={`${toolPosition.top}px`}
		>
			{#each marks as mark (mark.name)}
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					aria-label={text(mark.label[0], mark.label[1])}
					title={text(mark.label[0], mark.label[1])}
					aria-pressed={selected && editor.isActive(mark.name) ? true : false}
					class={buttonStyle + " " + mark.class + " aria-pressed:bg-accent"}
					onkeydown={dismissFromButton}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => formatSelection(mark.name)}>{mark.glyph}</Button
				>
			{/each}
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				aria-label={text("评论", "Comment")}
				title={text("评论", "Comment")}
				class={buttonStyle}
				onkeydown={dismissFromButton}
				onmousedown={(event) => event.preventDefault()}
				onclick={startComment}
			>
				<IconPlaceholder
					lucide="MessageSquareIcon"
					tabler="IconMessage"
					hugeicons="Message01Icon"
					phosphor="ChatCircleIcon"
					remixicon="RiChat1Line"
					class="size-3.5"
					aria-hidden="true"
				/>
			</Button>
		</div>
	{/if}
</div>

<Popover.Root open={draftSelection !== null}>
	<Popover.Content
		appearance="surface"
		portalProps={portal}
		customAnchor={anchor}
		side="bottom"
		align="start"
		sideOffset={8}
		role="dialog"
		aria-label={text("评论所选文字", "Comment on selected text")}
		onOpenAutoFocus={(event) => event.preventDefault()}
		onCloseAutoFocus={(event) => event.preventDefault()}
		onEscapeKeydown={(event) => event.preventDefault()}
		onInteractOutside={(event) => event.preventDefault()}
		class="w-[340px] max-w-[calc(100vw-16px)] p-3"
	>
		<CommentComposer mode="inline" {chinese} {portal} onCommit={post} onCancel={closeComment} />
	</Popover.Content>
</Popover.Root>
