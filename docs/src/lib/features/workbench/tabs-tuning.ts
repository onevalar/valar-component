import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	sourceWord,
	spacing,
	STYLE_VALUE,
	type RadiusLevel,
	type TunerSpec,
} from "./tuner.js";

const LIST_HEIGHTS = ["32", "36", "40"] as const;
const LIST_PADDING = [STYLE_VALUE, "3", "4"] as const;
const TRIGGER_PADDING_X = [STYLE_VALUE, "4", "6", "8", "10", "12", "14", "16"] as const;
const TRIGGER_PADDING_Y = [STYLE_VALUE, "0", "2", "4", "6", "8"] as const;
const valuesSchema = z
	.object({
		listHeight: z.enum(LIST_HEIGHTS),
		contentGap: z.number().int().min(4).max(24).multipleOf(2),
		listPadding: z.enum(LIST_PADDING),
		listRadius: z.enum(RADIUS_CHOICES),
		triggerPaddingX: z.enum(TRIGGER_PADDING_X),
		triggerPaddingY: z.enum(TRIGGER_PADDING_Y),
		triggerRadius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type TabsValues = z.infer<typeof valuesSchema>;
export type TabsOverrides = Partial<TabsValues>;

const VERTICAL = "group-data-vertical/tabs:";
const HORIZONTAL = "group-data-horizontal/tabs:";
const DEFAULT = "data-[variant=default]:";

function sourceClasses(files: { target: string; content: string }[], name: string): string {
	const file = files.find((f) => f.target.endsWith(`/${name}.svelte`))?.content;
	const classes = /(?:cn\(\s*|base:\s*)"([^"]*)"/.exec(file ?? "")?.[1];
	if (classes === undefined) throw new Error(`Tabs registry 缺少 ${name} 的样式`);
	return classes;
}

function paddingPx(value: string): number | undefined {
	const arbitrary = /^\[(\d+)px\]$/.exec(value);
	if (arbitrary) return Number(arbitrary[1]);
	const calc = /^\[calc\(--spacing\((\d+(?:\.\d+)?)\)\)\]$/.exec(value);
	if (calc) return Number(calc[1]) * 4;
	return /^\d+(?:\.\d+)?$/.test(value) ? Number(value) * 4 : undefined;
}

/** Mixed orientation/icon geometry is not misreported as one uniform pixel value. */
function uniformPadding<T extends string>(classes: string, axis: string, choices: readonly T[]): T {
	const base = new RegExp(`^p${axis}-([^ ]+)$`);
	const tokens = classes.split(/\s+/);
	const value = paddingPx(tokens.map((token) => base.exec(token)?.[1]).find(Boolean) ?? "");
	const variants = new RegExp(
		`:(?:p${axis}${axis === "x" ? "|pl|pr" : axis === "" ? "|px|py" : ""})-([^ ]+)$`
	);
	const mixed = tokens.some((token) => {
		const match = variants.exec(token);
		return match && paddingPx(match[1]) !== value;
	});
	const result = String(value);
	return !mixed && choices.includes(result as T) ? (result as T) : (STYLE_VALUE as T);
}

/** List rounding applies only to the filled variant; the line treatment is left intact. */
function uniformRadius(classes: string, list = false): TabsValues["listRadius"] {
	const tokens = classes.split(/\s+/);
	const radius = (prefix: string) =>
		tokens
			.find((token) => token.startsWith(`${prefix}rounded-`))
			?.slice(`${prefix}rounded-`.length);
	const horizontal = (list ? radius(DEFAULT) : undefined) ?? radius("");
	const vertical =
		(list ? radius(`${VERTICAL}${DEFAULT}`) : undefined) ?? radius(VERTICAL) ?? horizontal;
	return horizontal === vertical && RADIUS_LEVELS.includes(horizontal as RadiusLevel)
		? (horizontal as RadiusLevel)
		: STYLE_VALUE;
}

/** Reads installed, flattened sources, not the docs page's incidental layout. */
export function parseTabsSource(files: { target: string; content: string }[]): {
	values: TabsValues;
	context: null;
} {
	const root = sourceClasses(files, "tabs");
	const list = sourceClasses(files, "tabs-list");
	const trigger = sourceClasses(files, "tabs-trigger");
	return {
		values: valuesSchema.parse({
			listHeight: String(Number(/group-data-horizontal\/tabs:h-(\d+)/.exec(list)?.[1] ?? 8) * 4),
			contentGap: Number(sourceWord(String.raw`gap-(\d+(?:\.5)?)`, root) ?? 2) * 4,
			listPadding: uniformPadding(list, "", LIST_PADDING),
			listRadius: uniformRadius(list, true),
			triggerPaddingX: uniformPadding(trigger, "x", TRIGGER_PADDING_X),
			triggerPaddingY: uniformPadding(trigger, "y", TRIGGER_PADDING_Y),
			triggerRadius: uniformRadius(trigger),
		}),
		context: null,
	};
}

const registryTabs = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/tabs.json",
	{ import: "default" }
);

export function tabsOverrideClasses(overrides: TabsOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	const list: string[] = [];
	const trigger: string[] = [];
	if (safe.contentGap !== undefined) root.push(`gap-${spacing(safe.contentGap)}`);
	if (safe.listHeight !== undefined)
		list.push(`group-data-horizontal/tabs:h-${spacing(Number(safe.listHeight))}`);
	if (safe.listPadding !== undefined && safe.listPadding !== STYLE_VALUE) {
		const p = spacing(Number(safe.listPadding));
		list.push(`p-${p}`, `${VERTICAL}p-${p}`, `${HORIZONTAL}py-${p}`);
	}
	if (safe.listRadius !== undefined && safe.listRadius !== STYLE_VALUE)
		list.push(
			`${DEFAULT}rounded-${safe.listRadius}`,
			`${VERTICAL}${DEFAULT}rounded-${safe.listRadius}`
		);
	if (safe.triggerPaddingX !== undefined && safe.triggerPaddingX !== STYLE_VALUE) {
		const p = spacing(Number(safe.triggerPaddingX));
		trigger.push(
			`px-${p}`,
			`${VERTICAL}px-${p}`,
			`has-data-[icon=inline-start]:pl-${p}`,
			`has-data-[icon=inline-end]:pr-${p}`
		);
	}
	if (safe.triggerPaddingY !== undefined && safe.triggerPaddingY !== STYLE_VALUE) {
		const p = spacing(Number(safe.triggerPaddingY));
		trigger.push(`py-${p}`, `${VERTICAL}py-${p}`);
	}
	if (safe.triggerRadius !== undefined && safe.triggerRadius !== STYLE_VALUE)
		trigger.push(`rounded-${safe.triggerRadius}`, `${VERTICAL}rounded-${safe.triggerRadius}`);
	return Object.fromEntries(
		[
			["cn-tabs", root],
			["cn-tabs-list", list],
			["cn-tabs-trigger", trigger],
		]
			.filter(([, classes]) => classes.length)
			.map(([key, classes]) => [key, (classes as string[]).join(" ")])
	);
}

function tabsCss(scope: string, overrides: TabsOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const root = `${scope}[data-slot="tabs"]`;
	const list = `${scope}[data-slot="tabs-list"]`;
	const trigger = `${scope}[data-slot="tabs-trigger"]`;
	if (safe.contentGap !== undefined) rules.push(`${root} { gap: ${safe.contentGap}px; }`);
	if (safe.listHeight !== undefined)
		rules.push(`${list}[data-orientation="horizontal"] { height: ${safe.listHeight}px; }`);
	if (safe.listPadding !== undefined && safe.listPadding !== STYLE_VALUE)
		rules.push(`${list} { padding: ${safe.listPadding}px; }`);
	if (safe.listRadius !== undefined && safe.listRadius !== STYLE_VALUE)
		rules.push(`${list}[data-variant="default"] { border-radius: ${radiusCss(safe.listRadius)}; }`);
	if (safe.triggerPaddingX !== undefined && safe.triggerPaddingX !== STYLE_VALUE)
		rules.push(`${trigger} { padding-inline: ${safe.triggerPaddingX}px; }`);
	if (safe.triggerPaddingY !== undefined && safe.triggerPaddingY !== STYLE_VALUE)
		rules.push(`${trigger} { padding-block: ${safe.triggerPaddingY}px; }`);
	if (safe.triggerRadius !== undefined && safe.triggerRadius !== STYLE_VALUE)
		rules.push(`${trigger} { border-radius: ${radiusCss(safe.triggerRadius)}; }`);
	return rules.join("\n");
}

const pixelOptions = (choices: readonly string[]) =>
	choices.map((value) => ({
		value,
		label: value === STYLE_VALUE ? "样式自带（保留方向／图标差异）" : `${value}px · 统一`,
	}));
const radiusOptions = RADIUS_CHOICES.map((value) => ({
	value,
	label: value === STYLE_VALUE ? "样式自带（保留方向差异）" : RADIUS_LABELS[value],
}));
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const TABS_SPEC: TunerSpec<TabsValues, null> = {
	component: "tabs",
	title: "Tabs",
	description: "调整标签布局；统一档位覆盖方向与图标差异，保留线型下划线与键盘行为",
	storageKey: "valar.tabs-styles.v2",
	group: "布局与圆角",
	parameters: [
		{
			kind: "select",
			key: "listHeight",
			label: "水平列表高度",
			options: LIST_HEIGHTS.map((value) => ({ value, label: `${value}px` })),
		},
		{ kind: "number", key: "contentGap", label: "列表与内容间距（px）", min: 4, max: 24, step: 2 },
		{
			kind: "select",
			key: "listPadding",
			label: "列表内边距",
			options: pixelOptions(LIST_PADDING),
		},
		{ kind: "select", key: "listRadius", label: "默认列表圆角", options: radiusOptions },
		{
			kind: "select",
			key: "triggerPaddingX",
			label: "标签横向内边距",
			options: pixelOptions(TRIGGER_PADDING_X),
		},
		{
			kind: "select",
			key: "triggerPaddingY",
			label: "标签纵向内边距",
			options: pixelOptions(TRIGGER_PADDING_Y),
		},
		{ kind: "select", key: "triggerRadius", label: "标签圆角", options: radiusOptions },
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--muted", "默认列表背景"],
		["--muted-foreground", "次要文字"],
		["--background", "选中标签背景"],
		["--foreground", "选中文字与下划线"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryTabs[`/src/__registry__/json/styles/${style.replace("style-", "")}/tabs.json`];
		if (!load) throw new Error(`没有 ${style} 的 Tabs registry`);
		return parseTabsSource((await load()).files);
	},
	previewCss: (scope, overrides) => tabsCss(`${scope} `, overrides),
	pageCss: (overrides) => tabsCss(NOT_EDITOR, overrides),
	overrideClasses: (overrides) => tabsOverrideClasses(overrides),
};
