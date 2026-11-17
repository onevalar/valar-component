<script lang="ts">
	import { Editor, type JSONContent } from "@tiptap/core";
	import { TaskItem, TaskList } from "@tiptap/extension-list";
	import { StarterKit } from "@tiptap/starter-kit";
	import { onMount, tick } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { issueRichNodes } from "./issue-rich-nodes.svelte.js";
	import { richTextClass, safeIssueLink, type IssueInlineMedia } from "./rich-text.js";

	let {
		editor = $bindable<Editor | null>(null),
		content,
		chinese,
		focusOnMount,
		appearance = "default",
		portal,
		overlayPortal,
		commentLabel,
		commentPlaceholder,
		onAttach,
		inlineMedia = [],
		onAddInlineMedia,
		onEditorKeyDown,
		onChange,
	}: {
		editor?: Editor | null;
		content: JSONContent;
		chinese: boolean;
		focusOnMount: boolean;
		appearance?: "default" | "composer";
		portal?: { to: string };
		overlayPortal?: { to: string };
		commentLabel?: string;
		commentPlaceholder?: string;
		onAttach?: () => void;
		inlineMedia?: readonly IssueInlineMedia[];
		onAddInlineMedia?: (files: File[]) => IssueInlineMedia[];
		onEditorKeyDown?: (event: KeyboardEvent) => boolean;
		onChange: () => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const id = $props.id();
	const tools = [
		{
			key: "bold",
			zh: "粗体",
			en: "Bold",
			symbol: "B",
			class: "font-bold",
			shortcut: "Meta+B Control+B",
		},
		{
			key: "italic",
			zh: "斜体",
			en: "Italic",
			symbol: "I",
			class: "italic",
			shortcut: "Meta+I Control+I",
		},
		{
			key: "underline",
			zh: "下划线",
			en: "Underline",
			symbol: "U",
			class: "underline",
			shortcut: "Meta+U Control+U",
		},
		{
			key: "strike",
			zh: "删除线",
			en: "Strikethrough",
			symbol: "S",
			class: "line-through",
			shortcut: "Meta+Shift+S Control+Shift+S",
		},
		{
			key: "code",
			zh: "行内代码",
			en: "Inline code",
			symbol: "<>",
			class: "font-mono",
			shortcut: "Meta+E Control+E",
		},
		{ key: "heading", zh: "小标题", en: "Heading", symbol: "H", class: "font-semibold" },
		{ key: "bulletList", zh: "无序列表", en: "Bulleted list", symbol: "• ≡", class: "" },
		{ key: "orderedList", zh: "有序列表", en: "Numbered list", symbol: "1. ≡", class: "" },
		{ key: "blockquote", zh: "引用", en: "Quote", symbol: "❝", class: "" },
		{ key: "codeBlock", zh: "代码块", en: "Code block", symbol: "{ }", class: "font-mono" },
	] as const;
	const blocks = $derived([
		{ key: "heading", level: 1, zh: "一级标题", en: "Heading 1", symbol: "H1" },
		{ key: "heading", level: 2, zh: "二级标题", en: "Heading 2", symbol: "H2" },
		{ key: "heading", level: 3, zh: "三级标题", en: "Heading 3", symbol: "H3" },
		...tools.filter((tool) =>
			["bulletList", "orderedList", "codeBlock", "blockquote"].includes(tool.key)
		),
		{ key: "taskList", zh: "检查清单", en: "Checklist", symbol: "☑" },
		{ key: "issueDiagram", zh: "图示", en: "Diagram", symbol: "◇" },
		{ key: "issueFormula", zh: "LaTeX 公式块", en: "LaTeX math block", symbol: "∑" },
		{ key: "issueSection", zh: "折叠区块", en: "Collapsible section", symbol: "▸" },
		...(onAddInlineMedia
			? [{ key: "issueMedia", zh: "媒体", en: "Media", symbol: "▧" } as const]
			: []),
		...(onAttach
			? [{ key: "attachFiles", zh: "添加附件…", en: "Attach files…", symbol: "↥" } as const]
			: []),
	] as const);
	const composer = $derived(appearance === "composer");

	let host: HTMLDivElement;
	let toolbarState = $state<string[]>([]);
	let linkOpen = $state(false);
	let linkValue = $state("");
	let invalidLink = $state(false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let empty = $state(true);
	let blockMenu = $state(false);
	let blockInput = $state<HTMLInputElement | null>(null);
	let slashPosition = 0;
	let caret = $state<{ getBoundingClientRect: () => DOMRect; contextElement: Element }>();
	let mediaInput = $state<HTMLInputElement>();
	let mediaPosition = 0;
	let focusBlockId: string | undefined;

	onMount(() => {
		const instance = new Editor({
			element: host,
			content,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3, 4] },
					link: { openOnClick: false },
				}),
				TaskList,
				TaskItem.configure({
					nested: true,
					HTMLAttributes: { "data-type": "taskItem" },
					a11y: {
						checkboxLabel: (node) =>
							text(`清单项 ${node.textContent}`, `Checklist item ${node.textContent}`).trim(),
					},
				}),
				...issueRichNodes({
					chinese: () => chinese,
					portal: () => portal,
					overlayPortal: () => overlayPortal ?? portal,
					media: () => inlineMedia,
				}),
			],
			autofocus: focusOnMount ? "end" : false,
			editorProps: {
				attributes: {
					role: "textbox",
					"aria-multiline": "true",
					"aria-label":
						commentLabel ??
						(composer ? text("描述", "Description") : text("问题描述", "Issue description")),
					class: composer
						? "min-h-[58px] outline-none"
						: commentLabel
							? "min-h-6 outline-none"
							: "min-h-24 outline-none",
				},
				handleKeyDown: (view, event) => {
					if (onEditorKeyDown?.(event)) return true;
					const { selection } = view.state;
					if (
						composer &&
						event.key === "/" &&
						!event.isComposing &&
						!event.ctrlKey &&
						!event.metaKey &&
						!event.altKey &&
						selection.empty &&
						selection.$from.parent.type.name === "paragraph" &&
						!selection.$from.parent.content.size
					) {
						event.preventDefault();
						slashPosition = selection.from;
						instance.commands.insertContent("/");
						caret = {
							contextElement: view.dom,
							getBoundingClientRect: () => {
								const { left, right, top, bottom } = view.coordsAtPos(slashPosition);
								return new DOMRect(left, top, right - left, bottom - top);
							},
						};
						blockMenu = true;
						return true;
					}
					if (event.key === "k" && (event.metaKey || event.ctrlKey) && !event.isComposing) {
						event.preventDefault();
						void openLink();
						return true;
					}
					return false;
				},
			},
			onTransaction: ({ editor: current }) => {
				if (commentLabel || composer) return;
				// ProseMirror can dispatch a blur transaction while the editor is being removed.
				queueMicrotask(() => {
					if (current.isDestroyed) return;
					toolbarState = [...tools.map(({ key }) => key), "link"].filter((key) =>
						current.isActive(key)
					);
				});
			},
			onUpdate: ({ editor: current }) => {
				empty = current.isEmpty;
				onChange();
			},
		});
		editor = instance;
		empty = instance.isEmpty;
		return () => {
			instance.destroy();
			if (editor === instance) editor = null;
		};
	});

	function format(key: (typeof blocks)[number]["key"], level: 1 | 2 | 3 = 3) {
		const chain = editor?.chain().focus();
		if (!chain) return;
		if (blockMenu) {
			chain.deleteRange({ from: slashPosition, to: slashPosition + 1 });
			blockMenu = false;
		}
		switch (key) {
			case "bold":
				chain.toggleBold().run();
				break;
			case "italic":
				chain.toggleItalic().run();
				break;
			case "underline":
				chain.toggleUnderline().run();
				break;
			case "strike":
				chain.toggleStrike().run();
				break;
			case "code":
				chain.toggleCode().run();
				break;
			case "heading":
				chain.toggleHeading({ level }).run();
				break;
			case "bulletList":
				chain.toggleBulletList().run();
				break;
			case "orderedList":
				chain.toggleOrderedList().run();
				break;
			case "blockquote":
				chain.toggleBlockquote().run();
				break;
			case "codeBlock":
				chain.toggleCodeBlock().run();
				break;
			case "taskList":
				chain.toggleTaskList().run();
				break;
			case "attachFiles":
				chain.run();
				onAttach?.();
				break;
			case "issueDiagram":
			case "issueFormula":
			case "issueSection": {
				const blockId = globalThis.crypto.randomUUID();
				const node: JSONContent = { type: key, attrs: { id: blockId } };
				if (key === "issueSection")
					node.content = [{ type: "issueSectionTitle" }, { type: "paragraph" }];
				chain.insertContent([node, { type: "paragraph" }]).run();
				if (key === "issueSection") {
					const target = editor?.view.dom.querySelector(
						`[data-issue-block-id="${blockId}"] [data-slot="issue-section-title"]`
					);
					if (target && editor) editor.commands.setTextSelection(editor.view.posAtDOM(target, 0));
				} else {
					focusBlockId = blockId;
				}
				break;
			}
			case "issueMedia":
				chain.run();
				mediaPosition = editor?.state.selection.from ?? 0;
				mediaInput?.click();
				break;
		}
	}

	function addInlineMedia(event: Event & { currentTarget: HTMLInputElement }) {
		const files = Array.from(event.currentTarget.files ?? []).filter((file) =>
			/^(image|video)\//.test(file.type)
		);
		event.currentTarget.value = "";
		if (!files.length || !editor) return;
		const completed = onAddInlineMedia?.(files) ?? [];
		if (!completed.length) return;
		const nodes = completed.map(({ id, file }) => ({
			type: "issueMedia",
			attrs: { id, name: file.name, mime: file.type },
		}));
		editor
			.chain()
			.focus()
			.insertContentAt(mediaPosition, [...nodes, { type: "paragraph" }])
			.run();
	}

	async function restoreBlockFocus(event: Event) {
		event.preventDefault();
		const blockId = focusBlockId;
		focusBlockId = undefined;
		if (!editor || editor.isDestroyed) return;
		if (!blockId) {
			editor.commands.focus();
			return;
		}
		await tick();
		await new Promise(requestAnimationFrame);
		if (editor && !editor.isDestroyed) {
			editor.view.dom
				.querySelector<HTMLTextAreaElement>(`[data-issue-block-id="${blockId}"] textarea`)
				?.focus({ preventScroll: true });
		}
	}

	async function openLink() {
		linkValue = editor?.getAttributes("link").href ?? "";
		invalidLink = false;
		linkOpen = true;
		await tick();
		linkInput?.focus();
	}

	function closeLink() {
		linkOpen = false;
		editor?.commands.focus();
	}

	function applyLink() {
		if (!editor) return;
		if (!linkValue.trim()) {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			const href = safeIssueLink(linkValue);
			if (!href) {
				invalidLink = true;
				linkInput?.focus();
				return;
			}
			if (editor.state.selection.empty && !editor.isActive("link")) {
				editor
					.chain()
					.focus()
					.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] })
					.run();
			} else {
				editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
			}
		}
		closeLink();
	}
</script>

<div
	class={commentLabel || composer
		? "min-w-0"
		: "rounded-lg border border-border bg-(--detail-control)"}
>
	{#if !commentLabel && !composer}
		<div
			role="group"
			aria-label={text("文本格式", "Text formatting")}
			class="flex flex-wrap gap-0.5 border-b border-border p-1"
		>
			{#each tools as tool (tool.key)}
				<Button
					variant="ghost"
					size="icon-xs"
					class="h-6 min-w-6 px-1 text-xs text-muted-foreground aria-pressed:bg-accent aria-pressed:text-foreground {tool.class}"
					aria-label={text(tool.zh, tool.en)}
					title={text(tool.zh, tool.en)}
					data-inline-mark={"shortcut" in tool ? "" : undefined}
					aria-keyshortcuts={"shortcut" in tool ? tool.shortcut : undefined}
					aria-pressed={toolbarState.includes(tool.key)}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => format(tool.key)}>{tool.symbol}</Button
				>
			{/each}
			<Button
				variant="ghost"
				size="sm"
				class="h-6 px-2 text-xs text-muted-foreground aria-pressed:bg-accent"
				aria-expanded={linkOpen}
				aria-pressed={toolbarState.includes("link")}
				aria-keyshortcuts="Meta+K Control+K"
				onmousedown={(event) => event.preventDefault()}
				onclick={openLink}>{text("链接", "Link")}</Button
			>
		</div>
	{/if}
	{#if linkOpen}
		<div class="border-b border-border p-2">
			<div class="flex flex-wrap items-center gap-1.5">
				<Input
					bind:ref={linkInput}
					bind:value={linkValue}
					aria-label={text("链接地址", "Link address")}
					aria-invalid={invalidLink}
					aria-describedby={invalidLink ? id + "-link-error" : undefined}
					placeholder="https://"
					class="h-7 min-w-0 flex-1"
					oninput={() => (invalidLink = false)}
					onkeydown={(event) => {
						if (event.isComposing) return;
						if (event.key === "Enter" || event.key === "Escape") {
							event.preventDefault();
							event.stopPropagation();
							if (event.key === "Enter") applyLink();
							else closeLink();
						}
					}}
				/>
				<Button variant="ghost" size="xs" onclick={closeLink}
					>{text("关闭链接输入", "Close link input")}</Button
				>
				<Button variant="outline" size="xs" onclick={applyLink}
					>{text("应用链接", "Apply link")}</Button
				>
			</div>
			{#if invalidLink}<p
					id={id + "-link-error"}
					role="alert"
					class="mt-1 text-xs text-destructive"
				>
					{text(
						"请输入有效的 HTTP、HTTPS 或邮件链接。",
						"Enter a valid HTTP, HTTPS, or mailto link."
					)}
				</p>{/if}
		</div>
	{/if}
	<div class={["relative", composer && "pt-1.5 pb-3"]}>
		{#if composer && empty}
			<span
				aria-hidden="true"
				class="pointer-events-none absolute start-0 top-1.5 text-[15px] leading-[22.5px] text-(--composer-placeholder)"
			>
				{text("添加描述…", "Add description…")}
			</span>
		{:else if commentPlaceholder}
			<span
				aria-hidden="true"
				class="pointer-events-none absolute start-0 top-0 text-[15px] leading-6 text-(--activity-placeholder)"
				>{commentPlaceholder}</span
			>
		{/if}
		<div
			bind:this={host}
			class={[
				richTextClass,
				"[&_pre]:wrap-anywhere [&_pre]:whitespace-pre-wrap",
				composer
					? "leading-[22.5px]! [&_h1]:my-2 [&_h1]:text-2xl [&_h1]:font-semibold"
					: !commentLabel && "p-3",
			]}
		></div>
	</div>
	{#if onAddInlineMedia}
		<input
			type="file"
			accept="image/*,video/*"
			hidden
			multiple
			bind:this={mediaInput}
			onchange={addInlineMedia}
		/>
	{/if}
</div>

{#if composer}
	<Popover.Root bind:open={blockMenu}>
		<Popover.Content
			appearance="surface"
			portalProps={portal}
			customAnchor={caret}
			align="start"
			role="dialog"
			aria-label={text("插入内容块", "Insert block")}
			class="w-52 max-w-[calc(100vw-16px)] gap-0 p-0"
			onOpenAutoFocus={(event) => {
				event.preventDefault();
				blockInput?.focus({ preventScroll: true });
			}}
			onCloseAutoFocus={restoreBlockFocus}
		>
			<Command.Root class="rounded-[inherit] bg-transparent" disableInitialScroll>
				<Command.Input
					bind:ref={blockInput}
					aria-label={text("搜索内容块", "Search blocks")}
					placeholder={text("搜索内容块…", "Search blocks…")}
				/>
				<ScrollArea.Root type="hover" class="max-h-52 *:data-[slot=scroll-area-viewport]:max-h-52">
					<Command.List class="max-h-none overflow-clip p-1">
						<Command.Empty>{text("没有匹配的内容块", "No matching blocks")}</Command.Empty>
						{#each blocks as block (`${block.key}-${"level" in block ? block.level : ""}`)}
							<Command.Item
								value={text(block.zh, block.en)}
								class="min-h-8 gap-2 py-0 text-[13px]"
								onSelect={() => format(block.key, "level" in block ? block.level : undefined)}
							>
								<span class="w-5 shrink-0 text-muted-foreground" aria-hidden="true"
									>{block.symbol}</span
								>
								{text(block.zh, block.en)}
							</Command.Item>
						{/each}
					</Command.List>
				</ScrollArea.Root>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
{/if}
