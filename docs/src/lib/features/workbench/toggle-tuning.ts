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

export const TOGGLE_SIZES = [
	{ id: "sm", label: "小" },
	{ id: "default", label: "默认" },
	{ id: "lg", label: "大" },
] as const;
type Size = (typeof TOGGLE_SIZES)[number]["id"];
type SizeKey = `${Size}.${"height" | "paddingX"}`;
export type ToggleValues = Record<SizeKey, number> & {
	gap: number;
	radius: (typeof RADIUS_CHOICES)[number];
};
export type ToggleOverrides = Partial<ToggleValues>;
const numberParameters = TOGGLE_SIZES.flatMap(({ id, label }) => [
	{ key: `${id}.height` as SizeKey, label: `${label} · 高度（px）`, min: 20, max: 64 },
	{ key: `${id}.paddingX` as SizeKey, label: `${label} · 横向内边距（px）`, min: 0, max: 48 },
]);
const valuesSchema = z
	.object({
		...(Object.fromEntries(
			numberParameters.map((p) => [p.key, z.number().int().min(p.min).max(p.max).multipleOf(2)])
		) as Record<SizeKey, z.ZodNumber>),
		gap: z.number().int().min(0).max(16).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();

/** Toggle Group imports these same variants: shared geometry has one write-back owner. */
export function parseToggleSource(files: { target: string; content: string }[]): {
	values: ToggleValues;
	context: null;
} {
	const file = files.find((f) => f.target.split("/").at(-1) === "toggle.svelte")?.content ?? "";
	const base = /base:\s*"([^"]*)"/.exec(file)?.[1];
	const sizes = /\bsize:\s*\{([\s\S]*?)\n\s*\}/.exec(file)?.[1];
	if (base === undefined || sizes === undefined) throw new Error("Toggle registry 缺少变体样式");
	const values = {} as ToggleValues;
	const radii = new Set<string>();
	for (const { id } of TOGGLE_SIZES) {
		const classes = new RegExp(`\\b${id}:\\s*"([^"]*)"`).exec(sizes)?.[1];
		if (classes === undefined) throw new Error(`Toggle registry 缺少 ${id} 尺寸`);
		for (const [field, utility] of [
			["height", "h"],
			["paddingX", "px"],
		] as const) {
			const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, classes);
			if (value === undefined) throw new Error(`Toggle registry 缺少 ${id} 的 ${utility}`);
			values[`${id}.${field}`] = Number(value) * 4;
		}
		// An arbitrary/capped small radius is genuinely different, not the base level.
		radii.add(
			sourceWord("rounded-([^ ]+)", classes) ?? sourceWord("rounded-([^ ]+)", base) ?? STYLE_VALUE
		);
	}
	const radius = [...radii][0];
	values.radius =
		radii.size === 1
			? (RADIUS_CHOICES.find((value) => value === radius) ?? STYLE_VALUE)
			: STYLE_VALUE;
	const gap = sourceWord(String.raw`gap-(\d+(?:\.5)?)`, base);
	if (gap === undefined) throw new Error("Toggle registry 缺少图文间距");
	values.gap = Number(gap) * 4;
	return { values: valuesSchema.parse(values), context: null };
}

export function toggleOverrideClasses(overrides: ToggleOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string> = {};
	const base: string[] = [];
	if (safe.gap !== undefined) base.push(`gap-${spacing(safe.gap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) base.push(`rounded-${safe.radius}`);
	if (base.length) classes["cn-toggle"] = base.join(" ");
	for (const { id } of TOGGLE_SIZES) {
		const list: string[] = [];
		const height = safe[`${id}.height`];
		if (height !== undefined) list.push(`h-${spacing(height)}`, `min-w-${spacing(height)}`);
		const padding = safe[`${id}.paddingX`];
		if (padding !== undefined) list.push(`px-${spacing(padding)}`);
		if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
			list.push(`rounded-${safe.radius}`);
		if (list.length) classes[`cn-toggle-size-${id}`] = list.join(" ");
	}
	return classes;
}

function toggleCss(select: (slot: string) => string, overrides: ToggleOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	for (const slot of ["toggle", "toggle-group-item"]) {
		const root = select(slot);
		// Joined groups own their padding and outer corners, not their height or icon gap.
		const free = slot === "toggle" ? root : `${root}:not([data-spacing="0"])`;
		for (const { id } of TOGGLE_SIZES) {
			const height = safe[`${id}.height`];
			if (height !== undefined)
				rules.push(`${root}[data-size="${id}"] { height: ${height}px; min-width: ${height}px; }`);
			const padding = safe[`${id}.paddingX`];
			if (padding !== undefined) {
				const item = `${free}[data-size="${id}"]`;
				rules.push(
					`${item}:not(:has([data-icon="inline-start"])) { padding-left: ${padding}px; }`,
					`${item}:not(:has([data-icon="inline-end"])) { padding-right: ${padding}px; }`
				);
			}
		}
		if (safe.gap !== undefined) rules.push(`${root} { gap: ${safe.gap}px; }`);
		if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
			rules.push(`${free} { border-radius: ${radiusCss(safe.radius)}; }`);
	}
	return rules.join("\n");
}

const registryToggles = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/toggle.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const TOGGLE_SPEC: TunerSpec<ToggleValues, null> = {
	component: "toggle",
	title: "Toggle",
	description: "三档尺寸与图文间距也供 Toggle Group 使用；保留图标侧留白与拼接端点",
	storageKey: "valar.toggle-styles.v2",
	group: "尺寸与圆角",
	parameters: [
		...numberParameters.map((p) => ({ kind: "number" as const, ...p, step: 2 })),
		{ kind: "number", key: "gap", label: "图文间距（px）", min: 0, max: 16, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: RADIUS_CHOICES.map((value) => ({
				value,
				label: value === STYLE_VALUE ? "样式自带（保留小尺寸差异）" : RADIUS_LABELS[value],
			})),
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--muted", "按下与悬停背景"],
		["--foreground", "文字色"],
		["--input", "描边色"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryToggles[`/src/__registry__/json/styles/${style.replace("style-", "")}/toggle.json`];
		if (!load) throw new Error(`没有 ${style} 的 Toggle registry`);
		return parseToggleSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		toggleCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => toggleCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: toggleOverrideClasses,
};
