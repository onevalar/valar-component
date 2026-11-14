<script lang="ts">
	import { Editor, type JSONContent } from "@tiptap/core";
	import { StarterKit } from "@tiptap/starter-kit";
	import { onMount, tick } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { richTextClass, safeIssueLink } from "./model.js";

	let {
		editor = $bindable<Editor | null>(null),
		content,
		chinese,
		focusOnMount,
		commentLabel,
		commentPlaceholder,
		onEditorKeyDown,
		onChange,
	}: {
		editor?: Editor | null;
		content: JSONContent;
		chinese: boolean;
		focusOnMount: boolean;
		commentLabel?: string;
		commentPlaceholder?: string;
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

	let host: HTMLDivElement;
	let toolbarState = $state<string[]>([]);
	let linkOpen = $state(false);
	let linkValue = $state("");
	let invalidLink = $state(false);
	let linkInput = $state<HTMLInputElement | null>(null);

	onMount(() => {
		const instance = new Editor({
			element: host,
			content,
			extensions: [
				StarterKit.configure({ heading: { levels: [3, 4] }, link: { openOnClick: false } }),
			],
			autofocus: focusOnMount ? "end" : false,
			editorProps: {
				attributes: {
					role: "textbox",
					"aria-multiline": "true",
					"aria-label": commentLabel ?? text("问题描述", "Issue description"),
					class: commentLabel ? "min-h-6 outline-none" : "min-h-24 outline-none",
				},
				handleKeyDown: (_view, event) => {
					if (onEditorKeyDown?.(event)) return true;
					if (event.key === "k" && (event.metaKey || event.ctrlKey) && !event.isComposing) {
						event.preventDefault();
						void openLink();
						return true;
					}
					return false;
				},
			},
			onTransaction: ({ editor: current }) => {
				if (commentLabel) return;
				// ProseMirror can dispatch a blur transaction while the editor is being removed.
				queueMicrotask(() => {
					if (current.isDestroyed) return;
					toolbarState = [...tools.map(({ key }) => key), "link"].filter((key) =>
						current.isActive(key)
					);
				});
			},
			onUpdate: onChange,
		});
		editor = instance;
		return () => instance.destroy();
	});

	function format(key: (typeof tools)[number]["key"]) {
		const chain = editor?.chain().focus();
		if (!chain) return;
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
				chain.toggleHeading({ level: 3 }).run();
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

<div class={commentLabel ? "min-w-0" : "rounded-lg border border-border bg-(--detail-control)"}>
	{#if !commentLabel}
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
	<div class="relative">
		{#if commentPlaceholder}
			<span
				aria-hidden="true"
				class="pointer-events-none absolute start-0 top-0 text-[15px] leading-6 text-(--activity-placeholder)"
				>{commentPlaceholder}</span
			>
		{/if}
		<div bind:this={host} class={[richTextClass, !commentLabel && "p-3"]}></div>
	</div>
</div>
