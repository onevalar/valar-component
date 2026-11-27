import { issueLabels } from "../issue-composer";
import type { IssueActivityFieldChange } from "./activity-model.js";

const fields = {
	title: ["标题", "title"],
	description: ["描述", "description"],
	status: ["状态", "status"],
	priority: ["优先级", "priority"],
	assignee: ["负责人", "assignee"],
	project: ["项目", "project"],
	labels: ["标签", "labels"],
} as const;

export function describe(change: IssueActivityFieldChange, chinese: boolean) {
	const index = chinese ? 0 : 1;
	const field = fields[change.field][index];
	if (change.field !== "status" && change.field !== "priority")
		return chinese ? `更新了${field}` : `updated the ${field}`;
	const from = issueLabels[change.from][index];
	const to = issueLabels[change.to][index];
	return chinese
		? `将${field}从「${from}」改为「${to}」`
		: `changed the ${field} from ${from} to ${to}`;
}

export function dateText(value: string, chinese: boolean) {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? value
		: new Intl.DateTimeFormat(chinese ? "zh-CN" : "en", {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				timeZone: "UTC",
			}).format(date);
}
