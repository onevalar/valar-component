import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

export const separatorValuesSchema = z
	.object({
		horizontalThickness: z.number().int().min(1).max(8),
		verticalThickness: z.number().int().min(1).max(8),
	})
	.strict();
export const separatorOverridesSchema = separatorValuesSchema.partial();
export type SeparatorValues = z.infer<typeof separatorValuesSchema>;
export type SeparatorOverrides = Partial<SeparatorValues>;
export type SeparatorContext = null;

export function parseSeparatorSource(files: { target: string; content: string }[]): {
	values: SeparatorValues;
	context: SeparatorContext;
} {
	const source = files.find(
		(file) => file.target.split("/").at(-1) === "separator.svelte"
	)?.content;
	const root = /<SeparatorPrimitive\.Root\b[\s\S]*?class=\{cn\(([\s\S]*?)\)\}/.exec(
		source ?? ""
	)?.[1];
	if (root === undefined) throw new Error("Separator registry 缺少分隔线样式入口");
	const classes = cn(...[...root.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	const read = (utility: string) => {
		const value = sourceWord(`${utility}-(px|\\d+(?:\\.(?:25|5|75))?)`, classes);
		if (value === undefined) throw new Error(`Separator registry 缺少 ${utility} 粗细`);
		return value === "px" ? 1 : Number(value) * 4;
	};
	return {
		values: separatorValuesSchema.parse({
			horizontalThickness: read("data-horizontal:h"),
			verticalThickness: read("data-vertical:w"),
		}),
		context: null,
	};
}

export function separatorOverrideClasses(overrides: SeparatorOverrides): Record<string, string> {
	const safe = separatorOverridesSchema.parse(overrides);
	const utility = (value: number) => (value === 1 ? "px" : spacing(value));
	const classes = [
		safe.horizontalThickness !== undefined
			? `data-horizontal:h-${utility(safe.horizontalThickness)}`
			: "",
		safe.verticalThickness !== undefined
			? `data-vertical:w-${utility(safe.verticalThickness)}`
			: "",
	].filter(Boolean);
	return classes.length ? { "cn-separator-geometry": classes.join(" ") } : {};
}

function separatorCss(select: string, overrides: SeparatorOverrides): string {
	const safe = separatorOverridesSchema.parse(overrides);
	const size = (value: number) =>
		value === 1 ? "1px" : `calc(${spacing(value)} * var(--spacing))`;
	return [
		safe.horizontalThickness !== undefined
			? `${select}[data-orientation="horizontal"] { height: ${size(safe.horizontalThickness)}; }`
			: "",
		safe.verticalThickness !== undefined
			? `${select}[data-orientation="vertical"] { width: ${size(safe.verticalThickness)}; }`
			: "",
	]
		.filter(Boolean)
		.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/separator.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const SEPARATOR_SPEC: TunerSpec<SeparatorValues, SeparatorContext> = {
	component: "separator",
	title: "Separator",
	description: "分别调整横向与纵向粗细；保留方向、装饰／语义模式和全局边框色，不改变长度或布局",
	storageKey: "valar.separator-styles.v2",
	group: "分隔线几何",
	parameters: [
		{
			kind: "number",
			key: "horizontalThickness",
			label: "横向粗细（px 基准）",
			min: 1,
			max: 8,
			step: 1,
		},
		{
			kind: "number",
			key: "verticalThickness",
			label: "纵向粗细（px 基准）",
			min: 1,
			max: 8,
			step: 1,
		},
	],
	valuesSchema: separatorValuesSchema,
	tokens: [
		["--border", "分隔线颜色"],
		["--spacing", "间距基数（1px 档除外）"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/separator.json`];
		if (!load) throw new Error(`没有 ${style} 的 Separator registry`);
		return parseSeparatorSource((await load()).files);
	},
	previewCss: (scope, overrides) => separatorCss(`${scope} [data-slot="separator"]`, overrides),
	pageCss: (overrides) => separatorCss(`[data-slot="separator"]${NOT_EDITOR}`, overrides),
	overrideClasses: separatorOverrideClasses,
};
