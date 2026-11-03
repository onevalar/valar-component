import { z } from "zod";
import { cn } from "$lib/utils.js";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		paddingX: z.number().int().min(0).max(24).multipleOf(2),
		paddingY: z.number().int().min(0).max(16).multipleOf(2),
		labelSeriesGap: z.number().int().min(0).max(16).multipleOf(2),
	})
	.strict();
export type ChartValues = z.infer<typeof valuesSchema>;
export type ChartOverrides = Partial<ChartValues>;
export type ChartContext = null;

export function parseChartSource(files: { target: string; content: string }[]): {
	values: ChartValues;
	context: ChartContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "chart-tooltip.svelte")?.content ?? "";
	// Anchor on the real primitive, not the label or a nested grid. This also reads the
	// pre-editor registry, whose tooltip root has no data-slot yet, without inventing defaults.
	const args = /<TooltipPrimitive\.Root\b[^>]*>[\s\S]*?class=\{cn\(([\s\S]*?)\)\}/.exec(
		source
	)?.[1];
	if (args === undefined) throw new Error("Chart registry 缺少 Tooltip 根样式入口");
	// Injected utilities are a later cn argument: merge every literal before reading geometry.
	const classes = cn(
		...[...args.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([literal]) => JSON.parse(literal))
	);
	const read = (utility: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, classes);
		if (value === undefined) throw new Error(`Chart registry 缺少 Tooltip ${utility} 几何`);
		return Number(value) * 4;
	};
	return {
		values: valuesSchema.parse({
			paddingX: read("px"),
			paddingY: read("py"),
			labelSeriesGap: read("gap"),
		}),
		context: null,
	};
}

export function chartOverrideClasses(overrides: ChartOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	if (safe.paddingX !== undefined) classes.push(`px-${spacing(safe.paddingX)}`);
	if (safe.paddingY !== undefined) classes.push(`py-${spacing(safe.paddingY)}`);
	if (safe.labelSeriesGap !== undefined) classes.push(`gap-${spacing(safe.labelSeriesGap)}`);
	return classes.length ? { "cn-chart-tooltip-layout": classes.join(" ") } : {};
}

function chartCss(root: string, overrides: ChartOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const declarations: string[] = [];
	if (safe.paddingX !== undefined)
		declarations.push(`padding-inline: calc(var(--spacing) * ${spacing(safe.paddingX)});`);
	if (safe.paddingY !== undefined)
		declarations.push(`padding-block: calc(var(--spacing) * ${spacing(safe.paddingY)});`);
	if (safe.labelSeriesGap !== undefined)
		declarations.push(`gap: calc(var(--spacing) * ${spacing(safe.labelSeriesGap)});`);
	return declarations.length ? `${root} { ${declarations.join(" ")} }` : "";
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/chart.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const CHART_SPEC: TunerSpec<ChartValues, ChartContext> = {
	component: "chart",
	title: "Chart",
	description: "只调整提示框横纵留白与标题／系列区间距；不改图表数据、轴、尺寸或颜色",
	storageKey: "valar.chart-styles.v2",
	group: "提示框布局",
	parameters: [
		{ kind: "number", key: "paddingX", label: "横向留白（基准 px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "paddingY", label: "纵向留白（基准 px）", min: 0, max: 16, step: 2 },
		{
			kind: "number",
			key: "labelSeriesGap",
			label: "标题／系列区间距（基准 px）",
			min: 0,
			max: 16,
			step: 2,
		},
	],
	valuesSchema,
	tokens: [
		["--spacing", "间距刻度（基准 4px，留白与 gap 跟随此值缩放）"],
		["--radius", "提示框圆角基数"],
		["--text-xs", "提示框与刻度字号"],
		["--background", "提示框背景"],
		["--foreground", "提示框数值与文字"],
		["--chart-1", "桌面访问系列"],
		["--chart-2", "移动访问系列"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/chart.json`];
		if (!load) throw new Error(`没有 ${style} 的 Chart registry`);
		return parseChartSource((await load()).files);
	},
	previewCss: (scope, overrides) => chartCss(`${scope} [data-slot="chart-tooltip"]`, overrides),
	// Ordinary chart tooltips still portal to body. Select their own slot directly while
	// excluding the editor, whose local PortalTarget keeps each tooltip inside its pane.
	pageCss: (overrides) => chartCss(`[data-slot="chart-tooltip"]${NOT_EDITOR}`, overrides),
	overrideClasses: chartOverrideClasses,
};
