import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const even = (max: number) => z.number().int().min(0).max(max).multipleOf(2);
const valuesSchema = z
	.object({ groupGap: even(48), fieldGap: even(32), contentGap: even(24) })
	.strict();
export type FieldValues = z.infer<typeof valuesSchema>;
export type FieldOverrides = Partial<FieldValues>;
export type FieldContext = null;

const SLOTS = { groupGap: "field-group", fieldGap: "field", contentGap: "field-content" } as const;
const KEYS = Object.keys(SLOTS) as (keyof FieldValues)[];

export function parseFieldSource(files: { target: string; content: string }[]): {
	values: FieldValues;
	context: FieldContext;
} {
	const values: Partial<FieldValues> = {};
	for (const key of KEYS) {
		const slot = SLOTS[key];
		const source = files.find(
			(file) => file.target.split("/").at(-1) === `${slot}.svelte`
		)?.content;
		// Field's root geometry lives in tv's base, not the orientation variants.
		const args =
			slot === "field"
				? /base:\s*("(?:\\.|[^"\\])*")/.exec(source ?? "")?.[1]
				: /class=\{cn\(([\s\S]*?)\)\}/.exec(source ?? "")?.[1];
		if (args === undefined) throw new Error(`Field registry 缺少 ${slot} 样式`);
		const classes = cn(
			...[...args.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([literal]) => JSON.parse(literal))
		);
		const value = sourceWord("gap-(\\d+(?:\\.5)?)(?!\\.)", classes);
		if (value === undefined) throw new Error(`Field registry 缺少 ${slot} 的 gap`);
		values[key] = Number(value) * 4;
	}
	return { values: valuesSchema.parse(values), context: null };
}

export function fieldOverrideClasses(overrides: FieldOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return Object.fromEntries(
		KEYS.flatMap((key) =>
			safe[key] === undefined ? [] : [[`cn-${SLOTS[key]}`, `gap-${spacing(safe[key])}`]]
		)
	);
}

function fieldCss(select: (slot: string) => string, overrides: FieldOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	return KEYS.flatMap((key) => {
		if (safe[key] === undefined) return [];
		// The upstream direct-nested-group exception stays at gap-4. The base utility
		// being edited does not replace that parent-owned conditional utility.
		const exception = key === "groupGap" ? ':not([data-slot="field-group"] > *)' : "";
		return [
			`${select(SLOTS[key])}${exception} { gap: calc(var(--spacing) * ${spacing(safe[key])}); }`,
		];
	}).join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/field.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const FIELD_SPEC: TunerSpec<FieldValues, FieldContext> = {
	component: "field",
	title: "Field",
	storageKey: "valar.field-styles.v2",
	group: "字段布局",
	description: "只调字段组、字段与内容区间距；保留嵌套组例外、子控件尺寸及校验语义",
	parameters: [
		{ kind: "number", key: "groupGap", label: "字段组间距（基准 px）", min: 0, max: 48, step: 2 },
		{ kind: "number", key: "fieldGap", label: "字段内部间距（基准 px）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "contentGap", label: "内容区间距（基准 px）", min: 0, max: 24, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--spacing", "间距刻度（基准 4px）"],
		["--text-sm", "标签与说明字号"],
		["--text-xs", "紧凑样式字号"],
		["--destructive", "错误提示"],
		["--muted-foreground", "说明文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/field.json`];
		if (!load) throw new Error(`没有 ${style} 的 Field registry`);
		return parseFieldSource((await load()).files);
	},
	previewCss: (scope, overrides) => fieldCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => fieldCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: fieldOverrideClasses,
};
