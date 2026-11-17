import type {
	IssueInlineMedia,
	IssuePriority,
	IssueStatus,
} from "$lib/registry/ui/issue-composer/index.js";
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
	inlineMedia?: readonly IssueInlineMedia[];
};

export type IssueDetailOption = { id: string; label: string };
export type IssueDetailUpdate = Partial<Omit<IssueDetailValue, "id" | "attachments">>;
