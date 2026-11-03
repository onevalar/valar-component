import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({ itemSpacing: z.number().int().min(0).max(24).multipleOf(2) })
	.strict();
export type FormValues = z.infer<typeof valuesSchema>;
export type FormOverrides = Partial<FormValues>;
export type FormContext = null;

export function parseFormSource(files: { target: string; content: string }[]): {
	values: FormValues;
	context: FormContext;
} {
	const spacings = ["form-field.svelte", "form-element-field.svelte"].map((name) => {
		const source = files.find((file) => file.target.split("/").at(-1) === name)?.content;
		const args = /class=\{cn\(([\s\S]*?)\)\}/.exec(source ?? "")?.[1];
		if (args === undefined) throw new Error(`Form registry 缺少 ${name} 样式`);
		const classes = cn(
			...[...args.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([literal]) => JSON.parse(literal))
		);
		const value = sourceWord("space-y-(\\d+(?:\\.5)?)(?!\\.)", classes);
		if (value === undefined) throw new Error(`Form registry 缺少 ${name} 的 space-y`);
		return Number(value) * 4;
	});
	if (spacings[0] !== spacings[1])
		throw new Error("Form registry 的 Field 与 ElementField 间距不一致");
	return { values: valuesSchema.parse({ itemSpacing: spacings[0] }), context: null };
}

export function formOverrideClasses(overrides: FormOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return safe.itemSpacing === undefined
		? {}
		: { "cn-form-item-layout": `space-y-${spacing(safe.itemSpacing)}` };
}

function formCss(root: string, overrides: FormOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	if (safe.itemSpacing === undefined) return "";
	// Mirror Tailwind 4 space-y, not gap: Formsnap Control renders a snippet with
	// label/input siblings, and an empty FieldErrors node may still be the last child.
	const size = `calc(var(--spacing) * ${spacing(safe.itemSpacing)})`;
	return `${root} > :not(:last-child) { --tw-space-y-reverse: 0; margin-block-start: calc(${size} * var(--tw-space-y-reverse)); margin-block-end: calc(${size} * (1 - var(--tw-space-y-reverse))); }`;
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/form.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const FORM_SPEC: TunerSpec<FormValues, FormContext> = {
	component: "form",
	title: "Form",
	storageKey: "valar.form-styles.v2",
	group: "表单字段布局",
	description: "只调 Field／ElementField 内部垂直间距；标签、字号、控件尺寸与业务校验不在此修改",
	parameters: [
		{
			kind: "number",
			key: "itemSpacing",
			label: "表单项内部间距（基准 px）",
			min: 0,
			max: 24,
			step: 2,
		},
	],
	valuesSchema,
	tokens: [
		["--spacing", "间距刻度（基准 4px）"],
		["--text-sm", "说明与错误字号"],
		["--text-xs", "紧凑样式标签字号"],
		["--destructive", "校验错误"],
		["--muted-foreground", "说明文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/form.json`];
		if (!load) throw new Error(`没有 ${style} 的 Form registry`);
		return parseFormSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		formCss(`${scope} :is([data-slot="form-item"], [data-slot="form-element-item"])`, overrides),
	pageCss: (overrides) =>
		formCss(
			`:is([data-slot="form-item"], [data-slot="form-element-item"])${NOT_EDITOR}`,
			overrides
		),
	overrideClasses: formOverrideClasses,
};
