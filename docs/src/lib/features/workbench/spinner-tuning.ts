import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const SIZES = ["12", "16", "20", "24", "32"] as const;
const valuesSchema = z.object({ size: z.enum(SIZES) }).strict();
export type SpinnerValues = z.infer<typeof valuesSchema>;
export type SpinnerOverrides = Partial<SpinnerValues>;
export type SpinnerContext = { size: SpinnerValues["size"] };

export function parseSpinnerSource(files: { target: string; content: string }[]): {
	values: SpinnerValues;
	context: SpinnerContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "spinner.svelte")?.content ?? "";
	// Also reads registry generated before the new slot: there is exactly one cn call.
	const root = /class=\{cn\(([\s\S]*?)\)\}/.exec(source)?.[1];
	if (root === undefined) throw new Error("Spinner registry 缺少图标样式");
	const classes = cn(...[...root.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	const size = sourceWord("size-(\\d+)", classes);
	if (size === undefined || !classes.split(/\s+/).includes("animate-spin"))
		throw new Error("Spinner registry 缺少尺寸或旋转行为");
	const values = valuesSchema.parse({ size: String(Number(size) * 4) });
	return { values, context: { size: values.size } };
}

export function spinnerOverrideClasses(overrides: SpinnerOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return safe.size !== undefined ? { "cn-spinner": `size-${spacing(Number(safe.size))}` } : {};
}

function spinnerCss(
	select: string,
	overrides: SpinnerOverrides,
	context: SpinnerContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	if (safe.size === undefined || context === undefined) return "";
	const baseline = valuesSchema.parse(context).size;
	// Spinner marks caller-owned dimensions before cn merges them with the installed default.
	return `${select}[class~="size-${spacing(Number(baseline))}"]:not([data-spinner-size-explicit]) { width: ${safe.size}px; height: ${safe.size}px; }`;
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/spinner.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const SPINNER_SPEC: TunerSpec<SpinnerValues, SpinnerContext> = {
	component: "spinner",
	title: "Spinner",
	description: "只选择默认尺寸档位，调用处显式 size-* 优先；颜色、图标和旋转行为不变",
	storageKey: "valar.spinner-styles.v2",
	group: "默认尺寸",
	parameters: [
		{
			kind: "select",
			key: "size",
			label: "默认尺寸（px）",
			options: SIZES.map((value) => ({ value, label: `${value}px` })),
		},
	],
	valuesSchema,
	tokens: [["--foreground", "继承文字色"]],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/spinner.json`];
		if (!load) throw new Error(`没有 ${style} 的 Spinner registry`);
		return parseSpinnerSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		spinnerCss(`${scope} [data-slot="spinner"]`, overrides, context),
	pageCss: (overrides, context) =>
		spinnerCss(`[data-slot="spinner"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: spinnerOverrideClasses,
};
