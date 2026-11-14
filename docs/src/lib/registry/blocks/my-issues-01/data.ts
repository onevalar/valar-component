import {
	issueLabels,
	priorities as pickerPriorities,
	statuses,
} from "$lib/registry/ui/issue-composer/index.js";
import type { IssueDetailValue } from "$lib/registry/ui/issue-detail/index.js";

export const views = ["assigned", "created", "subscribed", "activity"] as const;
export { statuses };
export const priorities = [...pickerPriorities.slice(1), "none"] as const;

export type Issue = IssueDetailValue & { views: (typeof views)[number][] };

export const labels = {
	assigned: ["分配给我", "Assigned"],
	created: ["我创建的", "Created"],
	subscribed: ["我订阅的", "Subscribed"],
	activity: ["活动", "Activity"],
	...issueLabels,
} as const;

const sampleIssues = [
	[
		103,
		"补齐命令菜单的键盘导航",
		"Finish keyboard navigation in the command menu",
		"progress",
		"high",
		["assigned", "activity"],
	],
	[
		102,
		"修复移动端侧栏焦点恢复",
		"Restore focus after closing the mobile sidebar",
		"todo",
		"urgent",
		["assigned", "created"],
	],
	[
		101,
		"记录弹层在深色主题下的对比度",
		"Document overlay contrast in dark mode",
		"todo",
		"medium",
		["assigned", "created", "activity"],
	],
	[
		100,
		"检查空状态文案与操作入口",
		"Review empty-state labels and actions",
		"done",
		"low",
		["assigned", "created", "activity"],
	],
	[
		99,
		"整理设计 token 的使用示例",
		"Organize examples for design tokens",
		"backlog",
		"none",
		["assigned"],
	],
] as const;

export function makeSampleIssues(chinese: boolean): Issue[] {
	return sampleIssues.map(([number, zh, en, status, priority, issueViews]) => ({
		id: `VLR-${number}`,
		title: chinese ? zh : en,
		status,
		priority,
		assignee: issueViews.some((item) => item === "assigned") ? "self" : undefined,
		description:
			number === 103
				? chinese
					? "让所有命令都能通过键盘查找与执行。\n检查搜索、选项切换与退出后的焦点恢复。"
					: "Make every command accessible by keyboard.\nCheck search, option navigation, and focus restoration."
				: undefined,
		views: [...issueViews],
	}));
}
