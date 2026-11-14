import { CalendarDate, parseDate, startOfMonth, startOfWeek } from "@internationalized/date";
import { timeframeEnd } from "$lib/registry/ui/date-picker/index.js";
import { type Project } from "./data.js";

export const timelineScales = [
	{ id: "week", zh: "周", en: "Week", key: "w", dayWidth: 42, months: 2, step: { weeks: 1 } },
	{ id: "month", zh: "月", en: "Month", key: "m", dayWidth: 11, months: 6, step: { months: 1 } },
	{
		id: "quarter",
		zh: "季度",
		en: "Quarter",
		key: "q",
		dayWidth: 3.4,
		months: 18,
		step: { months: 3 },
	},
	{ id: "year", zh: "年", en: "Year", key: "y", dayWidth: 1.45, months: 36, step: { years: 1 } },
] as const;
export type TimelineScale = (typeof timelineScales)[number]["id"];
const millisecondsPerDay = 86_400_000;

export function timelineDays(start: CalendarDate, end: CalendarDate) {
	return (end.toDate("UTC").getTime() - start.toDate("UTC").getTime()) / millisecondsPerDay;
}

export function buildTimeline(anchor: CalendarDate, scale: TimelineScale, chinese: boolean) {
	const { dayWidth, months } = timelineScales.find((item) => item.id === scale)!;
	const start = startOfMonth(anchor.subtract({ months }));
	const end = startOfMonth(anchor.add({ months: months + 1 }));
	const width = timelineDays(start, end) * dayWidth;
	const offset = (date: CalendarDate) => timelineDays(start, date) * dayWidth;
	const locale = chinese ? "zh-CN" : "en-GB";
	const formatter = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
	const labels: { key: string; left: number; width: number; text: string }[] = [];
	for (let date = start; date.compare(end) < 0; date = date.add({ months: 1 })) {
		const month = formatter.format(date.toDate("UTC"));
		labels.push({
			key: date.toString(),
			left: offset(date),
			width: timelineDays(date, date.add({ months: 1 })) * dayWidth,
			text: date.month === 1 || date === start ? month + " " + date.year : month,
		});
	}
	const ticks: { key: string; left: number; text: string; week: number; monday: boolean }[] = [];
	if (scale !== "year") {
		const step = scale === "week" ? 1 : scale === "month" ? 7 : 14;
		let date = startOfWeek(start, "en-GB");
		for (; date.compare(end) < 0; date = date.add({ days: step })) {
			if (date.compare(start) < 0) continue;
			const monday = startOfWeek(date, "en-GB");
			const year = monday.add({ days: 3 }).year;
			const firstMonday = startOfWeek(new CalendarDate(year, 1, 4), "en-GB");
			ticks.push({
				key: date.toString(),
				left: offset(date),
				text: String(date.day),
				week: 1 + timelineDays(firstMonday, monday) / 7,
				monday: date.compare(monday) === 0,
			});
		}
	}
	return { start, end, width, dayWidth, offset, labels, ticks };
}

export function timelineProjectDates(project: Project, currentDate: CalendarDate) {
	const start = project.start && parseDate(project.start.date);
	const end = project.target && timeframeEnd(project.target);
	if (start && end) return { start, end, openStart: false, openEnd: false };
	if (start) return { start, end: start.add({ days: 13 }), openStart: false, openEnd: true };
	if (end) return { start: end.subtract({ days: 13 }), end, openStart: true, openEnd: false };
	return { start: currentDate, end: currentDate.add({ days: 9 }), openStart: true, openEnd: true };
}
