import { cn } from "cn";
import { z } from "zod";
import { spacing, type TunerSpec } from "./tuner.js";

const space = z.number().int().min(0).max(24).multipleOf(2);
const valuesSchema = z
	.object({ defaultGap: space, separatorGap: space, borderGap: space, borderPaddingBottom: space })
	.strict();
export type MarkerValues = z.infer<typeof valuesSchema>;
export type MarkerOverrides = Partial<MarkerValues>;
export type MarkerContext = null;
const VARIANTS = ["default", "separator", "border"] as const;

export function parseMarkerSource(files: { target: string; content: string }[]): {
	values: MarkerValues;
	context: MarkerContext;
} {
	const source = files.find((file) => file.target.split("/").at(-1) === "marker.svelte")?.content;
	if (!source) throw new Error("Marker registry 缺少根源码");
	const base = /base:\s*"([^"]*)"/.exec(source)?.[1];
	const variants = /variants:\s*\{\s*variant:\s*\{([\s\S]*?)\}/.exec(source)?.[1];
	if (base === undefined || variants === undefined) throw new Error("Marker registry 缺少变体样式");
	const values: Record<string, number> = {};
	for (const variant of VARIANTS) {
		const literal = new RegExp(`${variant}:\\s*"([^"]*)"`).exec(variants)?.[1];
		if (literal === undefined) throw new Error(`Marker registry 缺少 ${variant} 样式`);
		const classes = cn(base, literal);
		const read = (utility: RegExp) => {
			const word = classes
				.split(/\s+/)
				.filter((word) => utility.test(word))
				.at(-1);
			const value = word?.match(/^(?:gap|p|py|pb)-(\d+(?:\.5)?)$/)?.[1];
			if (value === undefined) throw new Error(`Marker registry 缺少 ${variant} 有限间距`);
			return Number(value) * 4;
		};
		values[`${variant}Gap`] = read(/^gap-/);
		if (variant === "border") values.borderPaddingBottom = read(/^(?:p|py|pb)-/);
	}
	return { values: valuesSchema.parse(values), context: null };
}

export function markerOverrideClasses(overrides: MarkerOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string> = {};
	for (const variant of VARIANTS) {
		const words: string[] = [];
		const gap = safe[`${variant}Gap`];
		if (gap !== undefined) words.push(`gap-${spacing(gap)}`);
		if (variant === "border" && safe.borderPaddingBottom !== undefined)
			words.push(`pb-${spacing(safe.borderPaddingBottom)}`);
		if (words.length) classes[`cn-marker-variant-${variant}`] = words.join(" ");
	}
	return classes;
}

function markerCss(select: (variant: string) => string, overrides: MarkerOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const scaled = (value: number) => `calc(var(--spacing) * ${spacing(value)})`;
	for (const variant of VARIANTS) {
		const declarations: string[] = [];
		const gap = safe[`${variant}Gap`];
		if (gap !== undefined) declarations.push(`gap: ${scaled(gap)};`);
		if (variant === "border" && safe.borderPaddingBottom !== undefined)
			declarations.push(`padding-bottom: ${scaled(safe.borderPaddingBottom)};`);
		if (declarations.length) rules.push(`${select(variant)} { ${declarations.join(" ")} }`);
	}
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/marker.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const MARKER_SPEC: TunerSpec<MarkerValues, MarkerContext> = {
	component: "marker",
	title: "Marker",
	storageKey: "valar.marker-styles.v2",
	group: "对话标记间距",
	description: "按变体调整间距及 border 底部留白；保留分隔伪线、图标、状态与全局字体颜色",
	parameters: [
		...VARIANTS.map((variant) => ({
			kind: "number" as const,
			key: `${variant}Gap`,
			label: `${variant} 间距（基准 px）`,
			min: 0,
			max: 24,
			step: 2,
		})),
		{
			kind: "number",
			key: "borderPaddingBottom",
			label: "border 底部留白（基准 px）",
			min: 0,
			max: 24,
			step: 2,
		},
	],
	valuesSchema,
	tokens: [
		["--spacing", "全局间距基数（只读）"],
		["--text-xs", "全局小号文字（只读）"],
		["--text-sm", "全局文字尺寸（只读）"],
		["--muted-foreground", "标记文字（只读）"],
		["--border", "边框与分隔线（只读）"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/marker.json`];
		if (!load) throw new Error(`没有 ${style} 的 Marker registry`);
		return parseMarkerSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		markerCss((variant) => `${scope} [data-slot="marker"][data-variant="${variant}"]`, overrides),
	pageCss: (overrides) =>
		markerCss(
			(variant) => `[data-slot="marker"][data-variant="${variant}"]${NOT_EDITOR}`,
			overrides
		),
	overrideClasses: markerOverrideClasses,
};
