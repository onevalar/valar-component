import type { IssuePriority } from "$lib/registry/ui/issue-composer/index.js";
import type { IssueDetailValue } from "$lib/registry/ui/issue-detail/index.js";

export const notificationTypes = {
	apps: ["应用与集成", "Apps and integrations"],
	assignment: ["分配", "Assignments"],
	billing: ["账单", "Billing"],
	comment: ["评论与回复", "Comments and replies"],
	customer: ["客户请求", "Customer requests"],
	document: ["文档变更", "Document changes"],
	loop: ["Loops", "Loops"],
	mention: ["提及", "Mentions"],
	pulse: ["Pulse 摘要", "Pulse summaries"],
	reaction: ["表情回应", "Reactions"],
	reminder: ["提醒与截止日期", "Reminders and deadlines"],
	review: ["审查", "Reviews"],
	status: ["状态变更", "Status changes"],
	subscription: ["订阅", "Subscriptions"],
	system: ["系统通知", "System notifications"],
	triage: ["待分流", "Triage"],
	update: ["更新", "Updates"],
} as const;

export type NotificationType = keyof typeof notificationTypes;
export type PriorityFilter = {
	sources: NotificationType[];
	levels: IssuePriority[];
};

export function defaultPriorityFilter(): PriorityFilter {
	return { sources: ["assignment", "mention"], levels: ["urgent", "high", "medium"] };
}

export type Notification = {
	id: string;
	issueId: string;
	type: NotificationType;
	sender: string;
	summary: string;
	created: string;
	unread: boolean;
	snoozedUntil?: number;
};

export const fields = ["type", "sender", "project", "priority", "status"] as const;
export type FilterField = (typeof fields)[number];
export type Filter = { values: string[]; exclude: boolean };

export const people = [
	{ id: "avery", label: "Avery Chen" },
	{ id: "morgan", label: "Morgan Lee" },
	{ id: "riley", label: "Riley Park" },
];

export function sampleInbox(chinese: boolean) {
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const projects = [
		{ id: "docs", label: text("文档站", "Documentation") },
		{ id: "ui", label: text("组件库", "Component library") },
	];
	const issues: IssueDetailValue[] = [
		{
			id: "VLR-206",
			title: text("核对搜索结果的键盘顺序", "Review keyboard order in search results"),
			description: text(
				"检查搜索结果分组之间的焦点顺序。覆盖鼠标和键盘操作，以及无结果时的焦点回退。",
				"Check focus order between result groups. Cover mouse and keyboard use and focus recovery when there are no results."
			),
			project: "docs",
			assignee: "avery",
			priority: "high",
			status: "progress",
		},
		{
			id: "VLR-204",
			title: text("补齐弹层的深色主题", "Finish dark mode for overlays"),
			description: text(
				"对照浅色和深色主题，检查 Popover 与 Tooltip 的表面、边框和焦点轮廓。",
				"Compare Popover and Tooltip surfaces, borders, and focus outlines in both themes."
			),
			project: "ui",
			assignee: "morgan",
			priority: "medium",
			status: "todo",
		},
		{
			id: "VLR-201",
			title: text("更新组件安装指南", "Update the component installation guide"),
			description: text(
				"在独立应用里验证新的安装步骤，然后更新文档示例。",
				"Verify the installation steps in an independent app and update the examples."
			),
			project: "docs",
			assignee: "riley",
			priority: "low",
			status: "done",
		},
	];
	const notifications: Notification[] = [
		{
			id: "n-4",
			issueId: "VLR-206",
			type: "assignment",
			sender: "avery",
			summary: text("将此问题分配给你", "assigned this issue to you"),
			created: "2026-11-12T14:20:00Z",
			unread: true,
		},
		{
			id: "n-3",
			issueId: "VLR-204",
			type: "mention",
			sender: "morgan",
			summary: text("在评论中提及你", "mentioned you in a comment"),
			created: "2026-11-12T11:05:00Z",
			unread: true,
		},
		{
			id: "n-2",
			issueId: "VLR-206",
			type: "comment",
			sender: "riley",
			summary: text("添加了一条评论", "added a comment"),
			created: "2026-11-11T16:20:00Z",
			unread: false,
		},
		{
			id: "n-1",
			issueId: "VLR-201",
			type: "status",
			sender: "riley",
			summary: text("将此问题标记为已完成", "marked this issue as done"),
			created: "2026-11-11T10:00:00Z",
			unread: false,
		},
	];
	return { projects, issues, notifications };
}
