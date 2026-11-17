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
	// Find the rotating icon classes in both the current and earlier registry sources.
	const classes = [...source.matchAll(/class=\{cn\(([\s\S]*?)\)\}/g)]
		.map(([, root]) => cn(...[...root.matchAll(/"([^"]*)"/g)].map((match) => match[1])))
		.find((candidate) =>
			candidate
				.split(/\s+/)
				.some((word) => word === "animate-spin" || word === "motion-safe:animate-spin")
		);
	const size = classes === undefined ? undefined : sourceWord("size-(\\d+)", classes);
	if (size === undefined) throw new Error("Spinner registry 缺少尺寸或旋转行为");
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
const ICON_SPINNER = '[data-slot="spinner"]:not([data-appearance="dots"])';
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
	previewCss: (scope, overrides, context) => spinnerCss(`${scope} ${ICON_SPINNER}`, overrides, context),
	pageCss: (overrides, context) => spinnerCss(`${ICON_SPINNER}${NOT_EDITOR}`, overrides, context),
	overrideClasses: spinnerOverrideClasses,
};
