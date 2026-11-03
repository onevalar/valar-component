import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		gap: z.number().int().min(0).max(16).multipleOf(2),
		width: z.number().int().min(224).max(320).multipleOf(16),
		contentGap: z.number().int().min(4).max(24).multipleOf(2),
	})
	.strict();
export type ColorPickerValues = z.infer<typeof valuesSchema>;
export type ColorPickerOverrides = Partial<ColorPickerValues>;
export type ColorPickerContext = null;

export function parseColorPickerSource(files: { target: string; content: string }[]): {
	values: ColorPickerValues;
	context: ColorPickerContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "color-picker.svelte")?.content ?? "";
	const classes = (element: RegExp) => {
		const tag = element.exec(source)?.[1] ?? "";
		const body = /class=\{cn\(([\s\S]*?)\)\}/.exec(tag)?.[1];
		if (body !== undefined) return cn(...[...body.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
		// Older flattened registries have a literal class on Content. Read that real source,
		// not a per-style defaults table; new registries merge every post-default cn argument.
		const literal = /class="([^"]*)"/.exec(tag)?.[1];
		if (literal === undefined) throw new Error("Color Picker registry 缺少自身样式");
		return cn(literal);
	};
	const root = classes(/<div\b([\s\S]*?data-slot="color-picker"[\s\S]*?)>/);
	const content = classes(/<Popover\.Content\b([\s\S]*?)>/);
	const gap = sourceWord("gap-(\\d+(?:\\.5)?)", root);
	const width = sourceWord("w-(\\d+)", content);
	const contentGap = sourceWord("gap-(\\d+(?:\\.5)?)", content);
	if (gap === undefined || width === undefined || contentGap === undefined)
		throw new Error("Color Picker registry 缺少自身布局参数");
	return {
		values: valuesSchema.parse({
			gap: Number(gap) * 4,
			width: Number(width) * 4,
			contentGap: Number(contentGap) * 4,
		}),
		context: null,
	};
}

export function colorPickerOverrideClasses(
	overrides: ColorPickerOverrides
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	if (safe.width !== undefined) content.push(`w-${spacing(safe.width)}`);
	if (safe.contentGap !== undefined) content.push(`gap-${spacing(safe.contentGap)}`);
	return {
		...(safe.gap !== undefined ? { "cn-color-picker": `gap-${spacing(safe.gap)}` } : {}),
		...(content.length ? { "cn-color-picker-content": content.join(" ") } : {}),
	};
}

function colorPickerCss(select: (slot: string) => string, overrides: ColorPickerOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.gap !== undefined) rules.push(`${select("color-picker")} { gap: ${safe.gap}px; }`);
	const content: string[] = [];
	if (safe.width !== undefined) content.push(`width: ${safe.width}px;`);
	if (safe.contentGap !== undefined) content.push(`gap: ${safe.contentGap}px;`);
	if (content.length) rules.push(`${select("color-picker-content")} { ${content.join(" ")} }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/color-picker.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const COLOR_PICKER_SPEC: TunerSpec<ColorPickerValues, ColorPickerContext> = {
	component: "color-picker",
	title: "Color Picker",
	description: "只调整标签间距与自有面板布局；不修改原生色盘、色值、主题 token 或全局 Popover",
	storageKey: "valar.color-picker-styles.v2",
	group: "自有布局",
	parameters: [
		{ kind: "number", key: "gap", label: "标签与触发器间距（px）", min: 0, max: 16, step: 2 },
		{ kind: "number", key: "width", label: "自有面板宽度（px）", min: 224, max: 320, step: 16 },
		{ kind: "number", key: "contentGap", label: "面板内容间距（px）", min: 4, max: 24, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--radius", "自有面板与控件圆角基数"],
		["--popover", "自有面板表面色"],
		["--popover-foreground", "自有面板前景色"],
		["--border", "边框色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/color-picker.json`];
		if (!load) throw new Error(`没有 ${style} 的 Color Picker registry`);
		return parseColorPickerSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		colorPickerCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	// Portaled page panels are not root descendants. Match the specific panel slot directly,
	// but never a panel owned by ANY component editor (including one that uses a portal).
	pageCss: (overrides) =>
		colorPickerCss(
			(slot) => `[data-slot="${slot}"]${NOT_EDITOR}:not([data-color-picker-editor])`,
			overrides
		),
	overrideClasses: colorPickerOverrideClasses,
};
