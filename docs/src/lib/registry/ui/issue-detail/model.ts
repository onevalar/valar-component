import type { IssuePriority, IssueStatus } from "$lib/registry/ui/issue-composer/index.js";
import type { JSONContent } from "@tiptap/core";

export type IssueDetailValue = {
	id: string;
	title: string;
	description?: string;
	descriptionContent?: JSONContent;
	status: IssueStatus;
	priority: IssuePriority;
	assignee?: string;
	project?: string;
	labels?: string[];
	attachments?: File[];
};

export type IssueDetailOption = { id: string; label: string };
export type IssueDetailUpdate = Partial<Omit<IssueDetailValue, "id" | "attachments">>;

export const richTextClass =
	"text-[15px] leading-6 font-[450] break-words [&_p+p]:mt-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-6 [&_li_p]:my-0 [&_blockquote]:my-2 [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-2 [&_h4]:font-semibold [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[13px] [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-(--detail-accent) [&_a]:underline [&_hr]:my-3";

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
