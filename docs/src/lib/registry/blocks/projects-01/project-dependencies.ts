import { parseDate } from "@internationalized/date";
import { timeframeEnd } from "$lib/registry/ui/date-picker/index.js";
import type { Project } from "./data.js";

export type ProjectDependencies = Partial<Record<string, string[]>>;

export function canAddDependency(graph: ProjectDependencies, project: string, blocker: string) {
	const remaining = [blocker];
	const visited = new Set<string>();
	for (const id of remaining) {
		if (id === project) return false;
		if (visited.has(id)) continue;
		visited.add(id);
		remaining.push(...(graph[id] ?? []));
	}
	return true;
}

export function dependencyDates(blocker: Project, blocked: Project) {
	const end = blocker.target && timeframeEnd(blocker.target);
	const start = blocked.start && parseDate(blocked.start.date);
	if (!end || !start) return undefined;
	return { end, start, violated: end.compare(start) > 0 };
}
