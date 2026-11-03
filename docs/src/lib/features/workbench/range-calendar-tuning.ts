import {
	calendarGeometryClasses,
	calendarGeometryCss,
	calendarValuesSchema,
	CALENDAR_PARAMETERS,
	CALENDAR_TOKENS,
	parseCalendarGeometrySource,
	type CalendarValues,
} from "./calendar-tuning.js";
import type { TunerSpec } from "./tuner.js";

export type RangeCalendarValues = CalendarValues;
export type RangeCalendarOverrides = Partial<RangeCalendarValues>;
export type RangeCalendarContext = null;

export function parseRangeCalendarSource(files: { target: string; content: string }[]) {
	return parseCalendarGeometrySource("range-calendar", files);
}
export function rangeCalendarOverrideClasses(
	overrides: RangeCalendarOverrides
): Record<string, string> {
	const words = calendarGeometryClasses(overrides);
	return words ? { "cn-range-calendar-geometry": words } : {};
}
const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/range-calendar.json",
	{ import: "default" }
);
export const RANGE_CALENDAR_SPEC: TunerSpec<RangeCalendarValues, RangeCalendarContext> = {
	component: "range-calendar",
	title: "Range Calendar",
	storageKey: "valar.range-calendar-styles.v2",
	description: "独立调整范围日历几何，不修改 Calendar 或范围端点／键盘／日期边界规则",
	group: "日期几何",
	parameters: CALENDAR_PARAMETERS,
	valuesSchema: calendarValuesSchema,
	tokens: CALENDAR_TOKENS,
	async readBaseline(_probe, style) {
		const load =
			registries[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/range-calendar.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Range Calendar registry`);
		return parseRangeCalendarSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		calendarGeometryCss(`${scope} [data-slot="range-calendar"]`, overrides),
	pageCss: (overrides) =>
		calendarGeometryCss(
			'[data-slot="range-calendar"]:not([data-component-tuner]):not([data-component-tuner] *)',
			overrides
		),
	overrideClasses: rangeCalendarOverrideClasses,
};
