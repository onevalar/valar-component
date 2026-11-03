import { cn } from "cn";
import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	sourceWord,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

/** Shared geometry contract, not a shared write-back anchor: ranges remain independent. */
export const calendarValuesSchema = z
	.object({
		cellSize: z.number().int().min(24).max(36).multipleOf(4),
		padding: z.number().int().min(0).max(16).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type CalendarValues = z.infer<typeof calendarValuesSchema>;
export type CalendarOverrides = Partial<CalendarValues>;
export type CalendarContext = null;

export function parseCalendarGeometrySource(
	component: "calendar" | "range-calendar",
	files: { target: string; content: string }[]
): { values: CalendarValues; context: CalendarContext } {
	const source = files.find(
		(file) => file.target.split("/").at(-1) === `${component}.svelte`
	)?.content;
	// Read every literal argument, including the post-default independent geometry anchor.
	const root = source && /class=\{cn\(([\s\S]*?)\)\}/.exec(source)?.[1];
	if (root === undefined) throw new Error(`${component} registry 缺少根几何`);
	const classes = cn(...[...root.matchAll(/"([^"\n]*)"/g)].map((match) => match[1]));
	const cellSize = sourceWord("\\[--cell-size:--spacing\\((\\d+(?:\\.5)?)\\)\\]", classes);
	const padding = sourceWord("p-(\\d+(?:\\.5)?)", classes);
	if (cellSize === undefined || padding === undefined)
		throw new Error(`${component} registry 缺少格子尺寸或留白`);
	let radius =
		sourceWord(`\\[--cell-radius:var\\(--radius-(${RADIUS_LEVELS.join("|")})\\)\\]`, classes) ??
		STYLE_VALUE;
	if (classes.split(" ").includes("[--cell-radius:0]")) radius = "none";
	if (classes.split(" ").includes("[--cell-radius:calc(infinity*1px)]")) radius = "full";
	return {
		values: calendarValuesSchema.parse({
			cellSize: Number(cellSize) * 4,
			padding: Number(padding) * 4,
			radius,
		}),
		context: null,
	};
}

export function parseCalendarSource(files: { target: string; content: string }[]) {
	return parseCalendarGeometrySource("calendar", files);
}

export function calendarGeometryClasses(overrides: CalendarOverrides): string {
	const safe = calendarValuesSchema.partial().parse(overrides);
	const words: string[] = [];
	if (safe.cellSize !== undefined) words.push(`[--cell-size:--spacing(${spacing(safe.cellSize)})]`);
	if (safe.padding !== undefined) words.push(`p-${spacing(safe.padding)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		words.push(
			safe.radius === "none"
				? "[--cell-radius:0]"
				: safe.radius === "full"
					? "[--cell-radius:calc(infinity*1px)]"
					: `[--cell-radius:var(--radius-${safe.radius})]`
		);
	return words.join(" ");
}

export function calendarOverrideClasses(overrides: CalendarOverrides): Record<string, string> {
	const words = calendarGeometryClasses(overrides);
	return words ? { "cn-calendar-geometry": words } : {};
}

export function calendarGeometryCss(selector: string, overrides: CalendarOverrides): string {
	const safe = calendarValuesSchema.partial().parse(overrides);
	const declarations: string[] = [];
	if (safe.cellSize !== undefined) declarations.push(`--cell-size: ${safe.cellSize}px;`);
	if (safe.padding !== undefined) declarations.push(`padding: ${safe.padding}px;`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		declarations.push(`--cell-radius: ${radiusCss(safe.radius)};`);
	return declarations.length ? `${selector} { ${declarations.join(" ")} }` : "";
}

export const CALENDAR_PARAMETERS: TunerSpec<CalendarValues, CalendarContext>["parameters"] = [
	{ kind: "number", key: "cellSize", label: "日期格子边长（px）", min: 24, max: 36, step: 4 },
	{ kind: "number", key: "padding", label: "根内边距（px）", min: 0, max: 16, step: 2 },
	{
		kind: "select",
		key: "radius",
		label: "日期格子圆角",
		options: [
			{ value: STYLE_VALUE, label: "样式自带" },
			...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
		],
	},
];
export const CALENDAR_TOKENS: [string, string][] = [
	["--radius", "圆角基数"],
	["--primary", "选中日期"],
	["--accent", "日期范围／今日"],
	["--muted-foreground", "不可选日期"],
];
const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/calendar.json",
	{ import: "default" }
);
export const CALENDAR_SPEC: TunerSpec<CalendarValues, CalendarContext> = {
	component: "calendar",
	title: "Calendar",
	storageKey: "valar.calendar-styles.v2",
	description: "只调日期几何，独立于 Range Calendar；保留本地化、禁用日期、年月选择和键盘行为",
	group: "日期几何",
	parameters: CALENDAR_PARAMETERS,
	valuesSchema: calendarValuesSchema,
	tokens: CALENDAR_TOKENS,
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/calendar.json`];
		if (!load) throw new Error(`没有 ${style} 的 Calendar registry`);
		return parseCalendarSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		calendarGeometryCss(`${scope} [data-slot="calendar"]`, overrides),
	pageCss: (overrides) =>
		calendarGeometryCss(
			'[data-slot="calendar"]:not([data-component-tuner]):not([data-component-tuner] *)',
			overrides
		),
	overrideClasses: calendarOverrideClasses,
};
