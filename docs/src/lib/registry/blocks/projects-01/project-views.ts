import { timelineScales, type TimelineScale } from "./timeline-model.js";

export const fields = ["status", "priority", "lead", "team"] as const;
export type FilterField = (typeof fields)[number];
export type Order = "name" | "priority" | "target" | "status";
export type ViewOptions = {
	view: string;
	filters: Partial<Record<FilterField, string[]>>;
	order?: Order;
	descending: boolean;
	timelineScale: TimelineScale;
	showEmpty: boolean;
	showProjectList: boolean;
	showWeekNumbers: boolean;
	showMilestones: boolean;
	showDependencies: boolean;
};

export type SavedView = ViewOptions & { id: string; name: string };

export const defaultViewOptions: ViewOptions = {
	view: "list",
	filters: {},
	descending: false,
	timelineScale: "month",
	showEmpty: true,
	showProjectList: true,
	showWeekNumbers: false,
	showMilestones: true,
	showDependencies: true,
};

function isSavedView(value: unknown): value is SavedView {
	if (!value || typeof value !== "object") return false;
	const item = value as Partial<SavedView>;
	return (
		typeof item.id === "string" &&
		typeof item.name === "string" &&
		item.id !== "all" &&
		["list", "board", "timeline"].includes(item.view ?? "") &&
		(item.order === undefined || ["name", "priority", "target", "status"].includes(item.order)) &&
		timelineScales.some(({ id }) => id === item.timelineScale) &&
		[
			item.descending,
			item.showEmpty,
			item.showProjectList,
			item.showWeekNumbers,
			item.showMilestones,
			item.showDependencies,
		].every((flag) => typeof flag === "boolean") &&
		!!item.filters &&
		typeof item.filters === "object" &&
		fields.every((field) => {
			const values = item.filters?.[field];
			return (
				values === undefined ||
				(Array.isArray(values) && values.every((value) => typeof value === "string"))
			);
		})
	);
}

export function loadSavedViews(key: string): SavedView[] {
	try {
		const views: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
		return Array.isArray(views) ? views.filter(isSavedView) : [];
	} catch {
		return [];
	}
}

export function storeSavedViews(key: string, views: SavedView[]) {
	try {
		localStorage.setItem(key, JSON.stringify(views));
	} catch {
		// The current preview can still use its views when browser storage is unavailable.
	}
}
