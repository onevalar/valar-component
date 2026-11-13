export const statuses = ["backlog", "todo", "progress", "done", "canceled"] as const;
export const priorities = ["none", "urgent", "high", "medium", "low"] as const;

export type IssueStatus = (typeof statuses)[number];
export type IssuePriority = (typeof priorities)[number];

export type IssueDraft = {
	title: string;
	description: string;
	status: IssueStatus;
	priority: IssuePriority;
	attachments: File[];
};

export const issueLabels = {
	status: ["状态", "Status"],
	priority: ["优先级", "Priority"],
	backlog: ["待规划", "Backlog"],
	todo: ["待处理", "Todo"],
	progress: ["进行中", "In progress"],
	done: ["已完成", "Done"],
	canceled: ["已取消", "Canceled"],
	none: ["无优先级", "No priority"],
	urgent: ["紧急", "Urgent"],
	high: ["高", "High"],
	medium: ["中", "Medium"],
	low: ["低", "Low"],
} as const;
