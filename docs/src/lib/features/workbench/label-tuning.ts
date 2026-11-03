import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z.object({ gap: z.number().int().min(0).max(24).multipleOf(2) }).strict();
export type LabelValues = z.infer<typeof valuesSchema>;
export type LabelOverrides = Partial<LabelValues>;
export type LabelContext = null;

export function parseLabelSource(files: { target: string; content: string }[]): {
	values: LabelValues;
	context: LabelContext;
} {
	const source = files.find((file) => file.target.split("/").at(-1) === "label.svelte")?.content;
	const args = /class=\{cn\(([\s\S]*?)\)\}/.exec(source ?? "")?.[1];
	if (args === undefined) throw new Error("Label registry 缺少根样式");
	const classes = cn(
		...[...args.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([literal]) => JSON.parse(literal))
	);
	const gap = sourceWord("gap-(\\d+(?:\\.5)?)(?!\\.)", classes);
	if (gap === undefined) throw new Error("Label registry 缺少 gap");
	return { values: valuesSchema.parse({ gap: Number(gap) * 4 }), context: null };
}

export function labelOverrideClasses(overrides: LabelOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return safe.gap === undefined ? {} : { "cn-label-layout": `gap-${spacing(safe.gap)}` };
}

function labelCss(root: string, overrides: LabelOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	return safe.gap === undefined
		? ""
		: `${root} { gap: calc(var(--spacing) * ${spacing(safe.gap)}); }`;
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/label.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
// Form.Label forwards its slot but has no gap of its own; Field.Label does,
// and that caller-owned gap must remain higher priority than Label's default.
const LABEL_ROOT = ':is([data-slot="label"], [data-slot="form-label"])';
export const LABEL_SPEC: TunerSpec<LabelValues, LabelContext> = {
	component: "label",
	title: "Label",
	storageKey: "valar.label-styles.v2",
	group: "标签布局",
	description: "只调 Label 的默认图文间距；Field.Label 等调用方自带的间距与全局字号保持不变",
	parameters: [
		{ kind: "number", key: "gap", label: "图文间距（基准 px）", min: 0, max: 24, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--spacing", "间距刻度（基准 4px）"],
		["--text-sm", "默认标签字号"],
		["--text-xs", "紧凑样式标签字号"],
		["--foreground", "标签文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/label.json`];
		if (!load) throw new Error(`没有 ${style} 的 Label registry`);
		return parseLabelSource((await load()).files);
	},
	previewCss: (scope, overrides) => labelCss(`${scope} ${LABEL_ROOT}`, overrides),
	pageCss: (overrides) => labelCss(`${LABEL_ROOT}${NOT_EDITOR}`, overrides),
	overrideClasses: labelOverrideClasses,
};
