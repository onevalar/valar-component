import { today } from "@internationalized/date";
import type { Timeframe } from "$lib/registry/ui/date-picker/index.js";

export const statuses = [
	{ id: "backlog", zh: "待规划", en: "Backlog", color: "border-dashed border-amber-500" },
	{ id: "planned", zh: "已计划", en: "Planned", color: "border-muted-foreground" },
	{ id: "active", zh: "进行中", en: "In Progress", color: "border-yellow-500 bg-yellow-500/30" },
	{ id: "completed", zh: "已完成", en: "Completed", color: "border-green-600 bg-green-600" },
	{
		id: "canceled",
		zh: "已取消",
		en: "Canceled",
		color: "border-muted-foreground bg-muted-foreground/40",
	},
] as const;

export const priorities = [
	{ id: "none", zh: "无优先级", en: "No priority" },
	{ id: "urgent", zh: "紧急", en: "Urgent" },
	{ id: "high", zh: "高", en: "High" },
	{ id: "medium", zh: "中", en: "Medium" },
	{ id: "low", zh: "低", en: "Low" },
] as const;

export const teams = [
	{ id: "design", zh: "设计", en: "Design" },
	{ id: "engineering", zh: "工程", en: "Engineering" },
] as const;
export const people = [
	{ id: "mira", team: "design", name: "Mira Chen", initials: "MC" },
	{ id: "alex", team: "engineering", name: "Alex Rivera", initials: "AR" },
] as const;

export type Status = (typeof statuses)[number]["id"];
export type Priority = (typeof priorities)[number]["id"];
export type ProjectDraft = {
	name: string;
	summary: string;
	description: string;
	status: Status;
	priority: Priority;
	teams: string[];
	lead: string;
	start?: Timeframe;
	target?: Timeframe;
};
export type Milestone = {
	id: string;
	name: string;
	date: string;
	progress: number;
};
export type Project = ProjectDraft & {
	id: string;
	issues: number;
	progress: number;
	milestones?: readonly Milestone[];
};
export type Option = { id: string; label: string; detail?: string; color?: string };

export function sampleProjects(chinese: boolean): Project[] {
	const date = today("UTC");
	return [
		{
			id: "sample-1",
			name: chinese ? "组件文档整理" : "Component documentation",
			summary: chinese ? "统一组件示例与使用说明。" : "Align examples and usage notes.",
			description: "",
			status: "backlog",
			priority: "none",
			teams: ["design"],
			lead: "",
			issues: 0,
			progress: 0,
		},
		{
			id: "sample-2",
			name: chinese ? "预览性能优化" : "Preview performance",
			summary: chinese ? "缩短组件预览加载时间。" : "Reduce load time for component previews.",
			description: "",
			status: "backlog",
			priority: "none",
			teams: ["engineering"],
			lead: "",
			issues: 0,
			progress: 0,
			start: { date: date.subtract({ days: 9 }).toString(), grain: "day" },
			target: { date: date.add({ days: 26 }).toString(), grain: "day" },
			milestones: [
				{
					id: "audit",
					name: chinese ? "基线测量" : "Baseline measurement",
					date: date.subtract({ days: 4 }).toString(),
					progress: 100,
				},
				{
					id: "review",
					name: chinese ? "预览验收" : "Preview review",
					date: date.add({ days: 10 }).toString(),
					progress: 40,
				},
			],
		},
	];
}
