import { Node, mergeAttributes } from "@tiptap/core";
import { mount, unmount } from "svelte";
import IssueMediaBlock from "./issue-media-block.svelte";
import IssueSourceBlock from "./issue-source-block.svelte";
import { readImageCrop } from "./media-crop.js";
import { type IssueInlineMedia, type IssueSourceKind } from "./rich-text.js";

type RichNodeOptions = {
	chinese: () => boolean;
	portal: () => { to: string } | undefined;
	overlayPortal: () => { to: string } | undefined;
	media: () => readonly IssueInlineMedia[];
};

function sourceNode(
	name: "issueDiagram" | "issueFormula",
	kind: IssueSourceKind,
	options: RichNodeOptions
) {
	return Node.create({
		name,
		group: "block",
		atom: true,
		addAttributes() {
			return { id: { default: null }, source: { default: "" } };
		},
		parseHTML() {
			return [{ tag: `div[data-issue-block="${kind}"]` }];
		},
		renderHTML({ HTMLAttributes }) {
			return ["div", mergeAttributes(HTMLAttributes, { "data-issue-block": kind })];
		},
		addNodeView() {
			return ({ editor, getPos, node }) => {
				const dom = document.createElement("div");
				dom.dataset.issueBlock = kind;
				dom.dataset.issueBlockId = node.attrs.id ?? "";
				dom.contentEditable = "false";
				let current = $state.raw(node);
				const block = mount(IssueSourceBlock, {
					target: dom,
					props: {
						kind,
						get source() {
							return String(current.attrs.source ?? "");
						},
						get chinese() {
							return options.chinese();
						},
						get portal() {
							return options.overlayPortal();
						},
						onSourceChange(source) {
							const position = getPos();
							if (typeof position === "number")
								editor.view.dispatch(editor.state.tr.setNodeAttribute(position, "source", source));
						},
						onRemove() {
							const position = getPos();
							if (typeof position === "number")
								editor
									.chain()
									.focus()
									.deleteRange({ from: position, to: position + current.nodeSize })
									.run();
						},
					},
				});
				return {
					dom,
					stopEvent: () => true,
					ignoreMutation: () => true,
					update(next) {
						if (next.type !== node.type) return false;
						current = next;
						return true;
					},
					destroy() {
						void unmount(block);
					},
				};
			};
		},
	});
}

function mediaNode(options: RichNodeOptions) {
	return Node.create({
		name: "issueMedia",
		group: "block",
		atom: true,
		addAttributes() {
			return {
				id: { default: null },
				name: { default: "" },
				mime: { default: "" },
				src: { default: null },
				crop: {
					default: null,
					parseHTML: (element) => {
						try {
							return readImageCrop(JSON.parse(element.getAttribute("data-crop") ?? "null"));
						} catch {
							return null;
						}
					},
					renderHTML: ({ crop }) => (crop ? { "data-crop": JSON.stringify(crop) } : {}),
				},
			};
		},
		parseHTML() {
			return [{ tag: 'div[data-issue-block="media"]' }];
		},
		renderHTML({ HTMLAttributes }) {
			return ["div", mergeAttributes(HTMLAttributes, { "data-issue-block": "media" })];
		},
		addNodeView() {
			return ({ editor, getPos, node }) => {
				const dom = document.createElement("div");
				dom.dataset.issueBlock = "media";
				dom.contentEditable = "false";
				let current = $state.raw(node);
				const findMedia = () => options.media().find(({ id }) => id === current.attrs.id);
				const block = mount(IssueMediaBlock, {
					target: dom,
					props: {
						get name() {
							return String(current.attrs.name ?? "");
						},
						get mime() {
							return String(current.attrs.mime ?? "");
						},
						get src() {
							return current.attrs.src;
						},
						get crop() {
							return current.attrs.crop;
						},
						get media() {
							return findMedia();
						},
						get chinese() {
							return options.chinese();
						},
						get portal() {
							return options.portal();
						},
						get overlayPortal() {
							return options.overlayPortal();
						},
						onCropChange(crop) {
							const position = getPos();
							if (typeof position === "number")
								editor.view.dispatch(editor.state.tr.setNodeAttribute(position, "crop", crop));
						},
						onRemove() {
							const position = getPos();
							if (typeof position === "number")
								editor
									.chain()
									.focus()
									.deleteRange({ from: position, to: position + current.nodeSize })
									.run();
						},
					},
				});
				return {
					dom,
					stopEvent: () => true,
					ignoreMutation: () => true,
					update(next) {
						if (next.type !== node.type) return false;
						current = next;
						return true;
					},
					destroy() {
						void unmount(block);
					},
				};
			};
		},
	});
}

function sectionNodes(options: RichNodeOptions) {
	const title = Node.create({
		name: "issueSectionTitle",
		content: "inline*",
		defining: true,
		parseHTML() {
			return [{ tag: 'div[data-slot="issue-section-title"]' }];
		},
		renderHTML() {
			return ["div", { "data-slot": "issue-section-title" }, 0];
		},
	});

	const section = Node.create({
		name: "issueSection",
		group: "block",
		content: "issueSectionTitle block+",
		defining: true,
		addAttributes() {
			return {
				id: { default: null },
				open: {
					default: true,
					parseHTML: (element) => element.getAttribute("data-open") !== "false",
					renderHTML: ({ open }) => ({ "data-open": String(open) }),
				},
			};
		},
		parseHTML() {
			return [{ tag: 'div[data-issue-block="section"]' }];
		},
		renderHTML({ HTMLAttributes }) {
			return ["div", mergeAttributes(HTMLAttributes, { "data-issue-block": "section" }), 0];
		},
		addNodeView() {
			return ({ editor, getPos, node }) => {
				const dom = document.createElement("div");
				dom.dataset.issueBlock = "section";
				dom.dataset.issueBlockId = node.attrs.id ?? "";
				dom.className = "relative my-2 min-w-0";
				const contentDOM = document.createElement("div");
				contentDOM.dataset.issueSectionEditor = "";
				const chinese = options.chinese();
				contentDOM.lang = chinese ? "zh" : "en";
				contentDOM.style.setProperty(
					"--issue-section-title-placeholder",
					JSON.stringify(chinese ? "添加区块标题…" : "Add section title…")
				);
				contentDOM.style.setProperty(
					"--issue-section-body-placeholder",
					JSON.stringify(chinese ? "添加区块内容…" : "Add section content…")
				);
				const sectionLayout = [
					"grid min-w-0 gap-4 ps-6 leading-[22.5px]",
					"[&>:is([data-slot=issue-section-title],[data-slot=issue-section-title]+p):has(>.ProseMirror-trailingBreak)]:before:pointer-events-none",
					"[&>:is([data-slot=issue-section-title],[data-slot=issue-section-title]+p):has(>.ProseMirror-trailingBreak)]:before:absolute",
					"[&>:is([data-slot=issue-section-title],[data-slot=issue-section-title]+p):has(>.ProseMirror-trailingBreak)]:before:text-muted-foreground",
					"[&>[data-slot=issue-section-title]:has(>.ProseMirror-trailingBreak)]:before:content-[var(--issue-section-title-placeholder)]",
					"[&>[data-slot=issue-section-title]+p:has(>.ProseMirror-trailingBreak)]:before:content-[var(--issue-section-body-placeholder)]"
				].join(" ");
				const toggle = document.createElement("button");
				toggle.type = "button";
				toggle.contentEditable = "false";
				toggle.dataset.slot = "issue-section-toggle";
				toggle.className =
					"absolute start-0 top-px grid h-5 w-[21px] place-items-center rounded text-muted-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring";
				const triangle = document.createElement("span");
				triangle.setAttribute("aria-hidden", "true");
				triangle.className =
					"grid size-4 origin-center place-items-center text-[10px] transition-transform motion-reduce:transition-none";
				triangle.textContent = "▶";
				toggle.append(triangle);
				dom.append(toggle, contentDOM);
				let current = node;
				function reflect() {
					const open = current.attrs.open !== false;
					const chinese = options.chinese();
					const heading = current.firstChild?.textContent.trim();
					toggle.setAttribute("aria-expanded", String(open));
					toggle.setAttribute(
						"aria-label",
						`${open ? (chinese ? "收起区块" : "Collapse section") : chinese ? "展开区块" : "Expand section"}${heading ? ` · ${heading}` : ""}`
					);
					triangle.classList.toggle("rotate-90", open);
					dom.dataset.open = String(open);
					const layout = open
						? sectionLayout
						: `${sectionLayout} [&>*:not([data-slot=issue-section-title])]:hidden`;
					if (contentDOM.className !== layout) contentDOM.className = layout;
				}
				reflect();
				toggle.onclick = () => {
					const position = getPos();
					if (typeof position === "number")
						editor.view.dispatch(
							editor.state.tr.setNodeAttribute(position, "open", current.attrs.open === false)
						);
				};
				return {
					dom,
					contentDOM,
					stopEvent: (event) =>
						event.target instanceof HTMLElement && toggle.contains(event.target),
					ignoreMutation: (mutation) =>
						mutation.type !== "selection" &&
						(!contentDOM.contains(mutation.target) ||
							(mutation.type === "attributes" && mutation.target === contentDOM)),
					update(next) {
						if (next.type !== node.type) return false;
						current = next;
						reflect();
						return true;
					},
				};
			};
		},
	});
	return [title, section];
}

export function issueRichNodes(options: RichNodeOptions) {
	return [
		sourceNode("issueDiagram", "diagram", options),
		sourceNode("issueFormula", "formula", options),
		mediaNode(options),
		...sectionNodes(options),
	];
}
