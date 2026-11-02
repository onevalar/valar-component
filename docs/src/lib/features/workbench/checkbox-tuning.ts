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

const valuesSchema = z
	.object({
		size: z.number().int().min(12).max(28).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type CheckboxValues = z.infer<typeof valuesSchema>;
export type CheckboxOverrides = Partial<CheckboxValues>;
export type CheckboxContext = { iconSizeDelta: number };

/** Read installed classes, retaining the style's box-to-icon difference after write-back. */
export function parseCheckboxSource(files: { target: string; content: string }[]): {
	values: CheckboxValues;
	context: CheckboxContext;
} {
	const file =
		files.find((file) => file.target.split("/").at(-1) === "checkbox.svelte")?.content ?? "";
	const root = /cn\(\s*"([^"]*)"/.exec(file)?.[1] ?? "";
	const indicator = /data-slot="checkbox-indicator"\s+class="([^"]*)"/.exec(file)?.[1] ?? "";
	const size = sourceWord(String.raw`size-(\d+(?:\.5)?)`, root);
	const iconSize = sourceWord(String.raw`\[&>svg\]:size-(\d+(?:\.5)?)`, indicator);
	if (size === undefined || iconSize === undefined)
		throw new Error("Checkbox registry 缺少方框或指示图标的尺寸");
	return {
		values: valuesSchema.parse({
			size: Number(size) * 4,
			radius: sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, root) ?? STYLE_VALUE,
		}),
		context: { iconSizeDelta: (Number(size) - Number(iconSize)) * 4 },
	};
}

function iconSize(size: number, context: CheckboxContext): number {
	return z
		.number()
		.int()
		.min(2)
		.max(28)
		.multipleOf(2)
		.parse(size - context.iconSizeDelta);
}

export function checkboxOverrideClasses(
	overrides: CheckboxOverrides,
	context: CheckboxContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	const classes: Record<string, string> = {};
	if (safe.size !== undefined) {
		root.push(`size-${spacing(safe.size)}`);
		classes["cn-checkbox-indicator"] = `[&>svg]:size-${spacing(iconSize(safe.size, context))}`;
	}
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) root.push(`rounded-${safe.radius}`);
	if (root.length) classes["cn-checkbox"] = root.join(" ");
	return classes;
}

function checkboxCss(
	select: (slot: string) => string,
	overrides: CheckboxOverrides,
	context: CheckboxContext
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.size !== undefined) {
		const icon = iconSize(safe.size, context);
		rules.push(
			`${select("checkbox")} { width: ${safe.size}px; height: ${safe.size}px; }`,
			`${select("checkbox-indicator")} > svg { width: ${icon}px; height: ${icon}px; }`
		);
	}
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		rules.push(`${select("checkbox")} { border-radius: ${radiusCss(safe.radius)}; }`);
	return rules.join("\n");
}

const registryCheckboxes = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/checkbox.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const CHECKBOX_SPEC: TunerSpec<CheckboxValues, CheckboxContext> = {
	component: "checkbox",
	title: "Checkbox",
	description: "调整方框尺寸与圆角，指示图标保留各样式的尺寸差，交互与状态配色不变",
	storageKey: "valar.checkbox-styles.v2",
	group: "尺寸与圆角",
	parameters: [
		{ kind: "number", key: "size", label: "方框尺寸（px）", min: 12, max: 28, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--primary", "选中背景"],
		["--primary-foreground", "选中图标"],
		["--input", "未选中边框与背景"],
		["--ring", "焦点环"],
		["--destructive", "错误状态"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryCheckboxes[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/checkbox.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Checkbox registry`);
		return parseCheckboxSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		checkboxCss((slot) => `${scope} [data-slot="${slot}"]`, overrides, context),
	pageCss: (overrides, context) =>
		checkboxCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: checkboxOverrideClasses,
};
