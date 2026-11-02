import { z } from "zod";
import { cn } from "$lib/utils.js";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		columnGap: z.number().int().min(0).max(32).multipleOf(2),
		rowGap: z.number().int().min(0).max(24).multipleOf(2),
		valueWidth: z.number().int().min(96).max(192).multipleOf(8),
	})
	.strict();
export type SliderFieldValues = z.infer<typeof valuesSchema>;
export type SliderFieldOverrides = Partial<SliderFieldValues>;

/** Read the actual flattened registry: injected utilities follow the original literals. */
export function parseSliderFieldSource(files: { target: string; content: string }[]): {
	values: SliderFieldValues;
	context: null;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "slider-field.svelte")?.content ?? "";
	const root = /data-slot="slider-field"[\s\S]*?class=\{cn\(\s*((?:"[^"]*"\s*,?\s*)+)/.exec(
		source
	)?.[1];
	const value = /<NumberField\b[\s\S]*?class=\{cn\(\s*((?:"[^"]*"\s*,?\s*)+)/.exec(source)?.[1];
	if (root === undefined || value === undefined)
		throw new Error("Slider Field registry 缺少布局或数值框样式入口");
	const read = (classes: string, utility: string) => {
		// Keep separate cn arguments in order: injected utilities must win over original literals.
		const merged = cn(...Array.from(classes.matchAll(/"([^"]*)"/g), (match) => match[1]));
		const token = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, merged);
		if (token === undefined) throw new Error(`Slider Field registry 缺少 ${utility} 几何`);
		return Number(token) * 4;
	};
	return {
		values: valuesSchema.parse({
			columnGap: read(root, "gap-x"),
			rowGap: read(root, "gap-y"),
			valueWidth: read(value, "w"),
		}),
		context: null,
	};
}

export function sliderFieldOverrideClasses(
	overrides: SliderFieldOverrides
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	if (safe.columnGap !== undefined) root.push(`gap-x-${spacing(safe.columnGap)}`);
	if (safe.rowGap !== undefined) root.push(`gap-y-${spacing(safe.rowGap)}`);
	return {
		...(root.length ? { "cn-slider-field": root.join(" ") } : {}),
		...(safe.valueWidth !== undefined
			? { "cn-slider-field-value": `w-${spacing(safe.valueWidth)}` }
			: {}),
	};
}

function sliderFieldCss(root: string, overrides: SliderFieldOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.columnGap !== undefined) rules.push(`${root} { column-gap: ${safe.columnGap}px; }`);
	if (safe.rowGap !== undefined) rules.push(`${root} { row-gap: ${safe.rowGap}px; }`);
	if (safe.valueWidth !== undefined)
		rules.push(`${root} > div > [data-slot="number-field"] { width: ${safe.valueWidth}px; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/slider-field.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const SLIDER_FIELD_SPEC: TunerSpec<SliderFieldValues, null> = {
	component: "slider-field",
	title: "Slider Field",
	description: "只调整组合列／行间距与数值框宽度；保留 Slider、Number Field 的几何和数值行为",
	storageKey: "valar.slider-field-styles.v2",
	group: "组合布局",
	parameters: [
		{ kind: "number", key: "columnGap", label: "滑块／数值列间距（px）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "rowGap", label: "标签／控件行间距（px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "valueWidth", label: "数值框宽度（px）", min: 96, max: 192, step: 8 },
	],
	valuesSchema,
	tokens: [
		["--radius", "子控件圆角基数"],
		["--text-sm", "标签与数值字号"],
		["--foreground", "文字色"],
		["--muted-foreground", "单位与说明色"],
		["--primary", "Slider 已选轨道"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/slider-field.json`];
		if (!load) throw new Error(`没有 ${style} 的 Slider Field registry`);
		return parseSliderFieldSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		sliderFieldCss(`${scope} [data-slot="slider-field"]`, overrides),
	pageCss: (overrides) => sliderFieldCss(`[data-slot="slider-field"]${NOT_EDITOR}`, overrides),
	overrideClasses: sliderFieldOverrideClasses,
};
