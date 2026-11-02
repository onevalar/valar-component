import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		size: z.number().int().min(12).max(28).multipleOf(2),
		gap: z.number().int().min(0).max(24).multipleOf(2),
	})
	.strict();
export type RadioGroupValues = z.infer<typeof valuesSchema>;
export type RadioGroupOverrides = Partial<RadioGroupValues>;

/** Dot offsets from half the item size survive repeated write-back and read-back. */
export type RadioGroupContext = {
	dotOffset: number;
	/** null means there is no separate dark size utility to preserve. */
	darkDotOffset: number | null;
};

/** Read installed, flattened classes, including the indicator's independent dark size. */
export function parseRadioGroupSource(files: { target: string; content: string }[]): {
	values: RadioGroupValues;
	context: RadioGroupContext;
} {
	const file = (name: string) =>
		files.find((file) => file.target.endsWith(`/${name}.svelte`))?.content ?? "";
	const root = /cn\(\s*"([^"]*)"/.exec(file("radio-group"))?.[1] ?? "";
	const itemSource = file("radio-group-item");
	const item = /cn\(\s*"([^"]*)"/.exec(itemSource)?.[1] ?? "";
	const icon = /<IconPlaceholder\b[\s\S]*?\bclass="([^"]*)"/.exec(itemSource)?.[1] ?? "";
	const sizePattern = String.raw`size-(\d+(?:\.(?:25|5|75))?)`;
	const px = (pattern: string, classes: string) => {
		const value = sourceWord(pattern, classes);
		if (value === undefined) throw new Error("Radio Group registry 缺少尺寸或间距工具类");
		return Number(value) * 4;
	};
	const size = px(sizePattern, item);
	const darkSize = sourceWord(`dark:${sizePattern}`, icon);
	return {
		values: valuesSchema.parse({ size, gap: px(String.raw`gap-(\d+(?:\.5)?)`, root) }),
		context: {
			dotOffset: px(sizePattern, icon) - size / 2,
			darkDotOffset: darkSize === undefined ? null : Number(darkSize) * 4 - size / 2,
		},
	};
}

export function radioGroupOverrideClasses(
	overrides: RadioGroupOverrides,
	context: RadioGroupContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string> = {};
	if (safe.gap !== undefined) classes["cn-radio-group"] = `gap-${spacing(safe.gap)}`;
	if (safe.size !== undefined) {
		classes["cn-radio-group-item"] = `size-${spacing(safe.size)}`;
		classes["cn-radio-group-indicator"] = `size-${spacing(safe.size)}`;
		const icon = [`size-${spacing(safe.size / 2 + context.dotOffset)}`];
		if (context.darkDotOffset !== null)
			icon.push(`dark:size-${spacing(safe.size / 2 + context.darkDotOffset)}`);
		classes["cn-radio-group-indicator-icon"] = icon.join(" ");
	}
	return classes;
}

function radioGroupCss(
	select: (slot: string) => string,
	overrides: RadioGroupOverrides,
	context: RadioGroupContext
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.gap !== undefined) rules.push(`${select("radio-group")} { gap: ${safe.gap}px; }`);
	if (safe.size !== undefined) {
		const size = `width: ${safe.size}px; height: ${safe.size}px;`;
		// IconPlaceholder renders an SVG, not a separate data-slot.
		const icon = `${select("radio-group-indicator")} > svg`;
		const dot = safe.size / 2 + context.dotOffset;
		rules.push(
			`${select("radio-group-item")}, ${select("radio-group-indicator")} { ${size} }`,
			`${icon} { width: ${dot}px; height: ${dot}px; }`
		);
		if (context.darkDotOffset !== null) {
			const darkDot = safe.size / 2 + context.darkDotOffset;
			// Matches both a local dark canvas and a dark ancestor outside the preview scope.
			rules.push(`${icon}:is(.dark *) { width: ${darkDot}px; height: ${darkDot}px; }`);
		}
	}
	return rules.join("\n");
}

const registryRadioGroups = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/radio-group.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const RADIO_GROUP_SPEC: TunerSpec<RadioGroupValues, RadioGroupContext> = {
	component: "radio-group",
	title: "Radio Group",
	description: "尺寸联动指示器与选中圆点，保留各样式的形状及深色差异",
	storageKey: "valar.radio-group-styles.v2",
	group: "尺寸与间距",
	parameters: [
		{ kind: "number", key: "size", label: "单选框尺寸（px）", min: 12, max: 28, step: 2 },
		{ kind: "number", key: "gap", label: "组内选项间距（px）", min: 0, max: 24, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--primary", "选中背景"],
		["--primary-foreground", "选中圆点"],
		["--foreground", "前景色（部分样式的选中态）"],
		["--input", "单选框边框与背景"],
		["--ring", "键盘焦点环"],
		["--destructive", "校验错误"],
		["--border-width", "边框粗细"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryRadioGroups[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/radio-group.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Radio Group registry`);
		return parseRadioGroupSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		radioGroupCss((slot) => `${scope} [data-slot="${slot}"]`, overrides, context),
	pageCss: (overrides, context) =>
		radioGroupCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: radioGroupOverrideClasses,
};
