import type { JSONContent } from "@tiptap/core";

export type IssueSourceKind = "diagram" | "formula";
export type IssueInlineMedia = { id: string; file: File };

export function issueMediaIds(content: JSONContent): Set<string> {
	const ids = new Set<string>();
	function visit(node: JSONContent) {
		if (node.type === "issueMedia" && typeof node.attrs?.id === "string") ids.add(node.attrs.id);
		node.content?.forEach(visit);
	}
	visit(content);
	return ids;
}

export function safeIssueMediaSrc(value: unknown) {
	const url = safeIssueLink(value);
	return url?.startsWith("https:") || url?.startsWith("http:") ? url : undefined;
}

export const richTextClass =
	"text-[15px] leading-6 font-[450] break-words [&_p+p]:mt-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-6 [&_li_p]:my-0 [&_blockquote]:my-2 [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-2 [&_h4]:font-semibold [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[13px] [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-(--detail-accent) [&_a]:underline [&_hr]:my-3 [&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:ps-0 [&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-start [&_li[data-type=taskItem]]:gap-2 [&_li[data-type=taskItem]>div]:min-w-0 [&_li[data-type=taskItem]>div]:flex-1 [&_li[data-type=taskItem]_input]:size-3.5 [&_li[data-type=taskItem]_input]:accent-(--detail-accent) [&_li[data-type=taskItem]_input:focus-visible]:outline-1 [&_li[data-type=taskItem]_input:focus-visible]:-outline-offset-1 [&_li[data-type=taskItem]_input:focus-visible]:outline-ring";

export function descriptionFromText(value: string): JSONContent {
	return {
		type: "doc",
		content: value.split(/\r?\n/).map((text) => ({
			type: "paragraph",
			content: text ? [{ type: "text", text }] : [],
		})),
	};
}

export function safeIssueLink(value: unknown) {
	if (typeof value !== "string") return;
	try {
		const url = new URL(value.trim());
		if (["http:", "https:", "mailto:"].includes(url.protocol)) return url.href;
	} catch {
		return undefined;
	}
}
