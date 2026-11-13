import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	radiusCss,
	sourceWord,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

export const ITEM_SIZES = [
	{ id: "default", label: "默认" },
	{ id: "sm", label: "小" },
	{ id: "xs", label: "特小" },
] as const;
type Size = (typeof ITEM_SIZES)[number]["id"];
type SizeKey = `${Size}.${"paddingX" | "paddingY" | "gap"}`;
export type ItemValues = Record<SizeKey, number> & {
	radius: (typeof RADIUS_CHOICES)[number];
};
export type ItemOverrides = Partial<ItemValues>;
const numberParameters = ITEM_SIZES.flatMap(({ id, label }) =>
	(
		[
			["paddingX", "横向留白", 32],
			["paddingY", "纵向留白", 24],
			["gap", "媒体／内容间距", 24],
		] as const
	).map(([field, title, max]) => ({
		key: `${id}.${field}` as SizeKey,
		label: `${label} · ${title}（px）`,
		min: 0,
		max,
	}))
);
const valuesSchema = z
	.object({
		...(Object.fromEntries(
			numberParameters.map((p) => [p.key, z.number().int().min(p.min).max(p.max).multipleOf(2)])
		) as Record<SizeKey, z.ZodNumber>),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();

export function parseItemSource(files: { target: string; content: string }[]): {
	values: ItemValues;
	context: null;
} {
	const source = files.find((f) => f.target.split("/").at(-1) === "item.svelte")?.content ?? "";
	const base = /base:\s*"([^"]*)"/.exec(source)?.[1];
	const sizes = /\bsize:\s*\{([\s\S]*?)\n\s*\}/.exec(source)?.[1];
	if (base === undefined || sizes === undefined)
		throw new Error("Item registry 缺少基础或尺寸样式");
	const values = {} as ItemValues;
	for (const { id } of ITEM_SIZES) {
		const classes = new RegExp(`\\b${id}:\\s*"([^"]*)"`).exec(sizes)?.[1];
		if (classes === undefined) throw new Error(`Item registry 缺少 ${id} 尺寸`);
		for (const [field, utility] of [
			["paddingX", "px"],
			["paddingY", "py"],
			["gap", "gap"],
		] as const) {
			const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, classes);
			if (value === undefined) throw new Error(`Item registry 缺少 ${id} 的 ${utility}`);
			values[`${id}.${field}`] = Number(value) * 4;
		}
	}
	const radius = sourceWord("rounded-([^ ]+)", base);
	if (radius === undefined) throw new Error("Item registry 缺少圆角样式");
	values.radius = RADIUS_CHOICES.find((value) => value === radius) ?? STYLE_VALUE;
	return { values: valuesSchema.parse(values), context: null };
}

export function itemOverrideClasses(overrides: ItemOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string> = {};
	for (const { id } of ITEM_SIZES) {
		const list: string[] = [];
		for (const [field, utility] of [
			["paddingX", "px"],
			["paddingY", "py"],
			["gap", "gap"],
		] as const) {
			const value = safe[`${id}.${field}`];
			if (value !== undefined) list.push(`${utility}-${spacing(value)}`);
		}
		if (list.length) classes[`cn-item-size-${id}`] = list.join(" ");
	}
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		classes["cn-item"] = `rounded-${safe.radius}`;
	return classes;
}

function itemCss(root: string, overrides: ItemOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	for (const { id } of ITEM_SIZES) {
		// Item's default variant does not emit data-size when the prop is omitted.
		const select =
			id === "default"
				? `${root}:not([data-size="sm"]):not([data-size="xs"])`
				: `${root}[data-size="${id}"]`;
		// The xs dropdown composition owns zero padding; preserve its higher-priority utility.
		const padded = id === "xs" ? `${select}:not([data-slot="dropdown-menu-content"] *)` : select;
		const x = safe[`${id}.paddingX`],
			y = safe[`${id}.paddingY`],
			gap = safe[`${id}.gap`];
		if (x !== undefined) rules.push(`${padded} { padding-inline: ${x}px; }`);
		if (y !== undefined) rules.push(`${padded} { padding-block: ${y}px; }`);
		if (gap !== undefined) rules.push(`${select} { gap: ${gap}px; }`);
	}
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		rules.push(`${root} { border-radius: ${radiusCss(safe.radius)}; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/item.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
const GENERIC_ITEM = '[data-slot="item"]:not([data-appearance="issue-row"])';
export const ITEM_SPEC: TunerSpec<ItemValues, null> = {
	component: "item",
	title: "Item",
	description: "分别调整三档行留白与媒体／内容间距；保留子控件、媒体、文字及列表语义",
	storageKey: "valar.item-styles.v2",
	group: "行密度与圆角",
	parameters: [
		...numberParameters.map((p) => ({ kind: "number" as const, ...p, step: 2 })),
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: RADIUS_CHOICES.map((value) => ({
				value,
				label: value === STYLE_VALUE ? "样式自带" : RADIUS_LABELS[value],
			})),
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--text-sm", "正文字号"],
		["--foreground", "文字色"],
		["--muted", "弱化与悬停背景"],
		["--border", "边框色"],
		["--ring", "焦点内描边"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/item.json`];
		if (!load) throw new Error(`没有 ${style} 的 Item registry`);
		return parseItemSource((await load()).files);
	},
	previewCss: (scope, overrides) => itemCss(`${scope} ${GENERIC_ITEM}`, overrides),
	pageCss: (overrides) => itemCss(`${GENERIC_ITEM}${NOT_EDITOR}`, overrides),
	overrideClasses: itemOverrideClasses,
};
