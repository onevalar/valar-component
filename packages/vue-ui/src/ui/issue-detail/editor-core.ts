import { Editor, type JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { safeIssueLink } from "./model.js";

export const tools = [
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

export type Tool = (typeof tools)[number]["key"];

export function format(editor: Editor, key: Tool) {
	const chain = editor.chain().focus();
	switch (key) {
		case "bold":
			return chain.toggleBold().run();
		case "italic":
			return chain.toggleItalic().run();
		case "underline":
			return chain.toggleUnderline().run();
		case "strike":
			return chain.toggleStrike().run();
		case "code":
			return chain.toggleCode().run();
		case "heading":
			return chain.toggleHeading({ level: 3 }).run();
		case "bulletList":
			return chain.toggleBulletList().run();
		case "orderedList":
			return chain.toggleOrderedList().run();
		case "blockquote":
			return chain.toggleBlockquote().run();
		case "codeBlock":
			return chain.toggleCodeBlock().run();
	}
}

export function applyLink(editor: Editor, value: string) {
	if (!value.trim()) {
		editor.chain().focus().extendMarkRange("link").unsetLink().run();
		return true;
	}
	const href = safeIssueLink(value);
	if (!href) return false;
	if (editor.state.selection.empty && !editor.isActive("link")) {
		editor
			.chain()
			.focus()
			.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] })
			.run();
	} else {
		editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
	}
	return true;
}

export function isComposing(event: KeyboardEvent) {
	return event.isComposing || event.keyCode === 229;
}

export function createIssueEditor({
	element,
	content,
	label,
	comment,
	focus,
	onChange,
	onKeys,
	onFormats,
}: {
	element: HTMLElement;
	content: JSONContent;
	label: string;
	comment: boolean;
	focus: boolean;
	onChange: (editor: Editor) => void;
	onKeys: (event: KeyboardEvent) => boolean;
	onFormats: (formats: string[]) => void;
}) {
	return new Editor({
		element,
		content,
		extensions: [
			StarterKit.configure({
				heading: { levels: [3, 4] },
				link: { openOnClick: false, isAllowedUri: (value) => !!safeIssueLink(value) },
			}),
		],
		autofocus: focus ? "end" : false,
		editorProps: {
			attributes: {
				role: "textbox",
				"aria-multiline": "true",
				"aria-label": label,
				class: comment ? "min-h-6 outline-none" : "min-h-24 outline-none",
			},
			handleKeyDown: (_view, event) => onKeys(event),
		},
		onUpdate: ({ editor }) => onChange(editor),
		onTransaction: ({ editor }) => {
			if (!comment)
				queueMicrotask(() => {
					if (!editor.isDestroyed)
						onFormats(
							[...tools.map(({ key }) => key), "link"].filter((key) => editor.isActive(key))
						);
				});
		},
	});
}

const elements = {
	paragraph: "p",
	bulletList: "ul",
	listItem: "li",
	blockquote: "blockquote",
} as const;
const marks = { bold: "strong", italic: "em", underline: "u", strike: "s", code: "code" } as const;

/** Project structured data onto an allowlist; never substitute HTML or spread document attributes. */
export function richNodes<T>(
	content: JSONContent,
	element: (
		tag: string,
		attrs: { key: string; href?: string; start?: number },
		children: (T | string)[]
	) => T
) {
	function from(node: JSONContent, key: string): (T | string)[] {
		if (node.type === "text") {
			const value = (node.marks ?? []).reduceRight<T | string>((child, mark, index) => {
				const markKey = `${key}-mark-${index}`;
				if (mark.type === "link") {
					const href = safeIssueLink(mark.attrs?.href);
					return href ? element("a", { key: markKey, href }, [child]) : child;
				}
				return Object.hasOwn(marks, mark.type)
					? element(marks[mark.type as keyof typeof marks], { key: markKey }, [child])
					: child;
			}, node.text ?? "");
			return [value];
		}
		const children = (node.content ?? []).flatMap((child, index) => from(child, `${key}-${index}`));
		switch (node.type) {
			case "hardBreak":
				return [element("br", { key }, [])];
			case "horizontalRule":
				return [element("hr", { key }, [])];
			case "codeBlock":
				return [element("pre", { key }, [element("code", { key: `${key}-code` }, children)])];
			case "heading":
				return [element(node.attrs?.level === 4 ? "h4" : "h3", { key }, children)];
			case "orderedList":
				return [
					element(
						"ol",
						{ key, start: Number.isSafeInteger(node.attrs?.start) ? node.attrs?.start : undefined },
						children
					),
				];
			case "paragraph":
				return [
					element(
						"p",
						{ key },
						children.length ? children : [element("br", { key: `${key}-empty` }, [])]
					),
				];
			default:
				return node.type && Object.hasOwn(elements, node.type)
					? [element(elements[node.type as keyof typeof elements], { key }, children)]
					: children;
		}
	}
	return from(content, "root");
}
