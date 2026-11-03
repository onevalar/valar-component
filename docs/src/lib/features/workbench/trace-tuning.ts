import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const space = z.number().int().min(0).max(24).multipleOf(2);
const valuesSchema = z.object({ gap: space, detailMarginTop: space }).strict();
export type TraceValues = z.infer<typeof valuesSchema>;
export type TraceOverrides = Partial<TraceValues>;
export type TraceContext = null;

export function parseTraceSource(files: { target: string; content: string }[]): {
	values: TraceValues;
	context: TraceContext;
} {
	const read = (file: string, slot: string, utility: string) => {
		const source = files.find((entry) => entry.target.split("/").at(-1) === file)?.content ?? "";
		const literal = new RegExp(
			`data-slot="${slot}"[\\s\\S]*?class=\\{cn\\(([\\s\\S]*?)\\)\\}`
		).exec(source)?.[1];
		if (literal === undefined) throw new Error(`Trace registry 缺少 ${slot} 样式`);
		const classes = cn(...[...literal.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, classes);
		if (value === undefined) throw new Error(`Trace registry 缺少 ${slot} 的 ${utility}`);
		return Number(value) * 4;
	};
	return {
		values: valuesSchema.parse({
			gap: read("trace.svelte", "trace", "gap"),
			detailMarginTop: read(
				"trace-collapsible-content.svelte",
				"trace-collapsible-content-inner",
				"mt"
			),
		}),
		context: null,
	};
}

export function traceOverrideClasses(overrides: TraceOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return {
		...(safe.gap !== undefined ? { "cn-trace": `gap-${spacing(safe.gap)}` } : {}),
		...(safe.detailMarginTop !== undefined
			? { "cn-trace-collapsible-content-inner": `mt-${spacing(safe.detailMarginTop)}` }
			: {}),
	};
}
function traceCss(select: (slot: string) => string, overrides: TraceOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.gap !== undefined) rules.push(`${select("trace")} { gap: ${safe.gap}px; }`);
	if (safe.detailMarginTop !== undefined)
		rules.push(
			`${select("trace-collapsible-content-inner")} { margin-top: ${safe.detailMarginTop}px; }`
		);
	return rules.join("\n");
}
const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/trace.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const TRACE_SPEC: TunerSpec<TraceValues, TraceContext> = {
	component: "trace",
	title: "Trace",
	description: "仅调整列表间距与展开详情上间距；保留图标、树线、运行状态与真实折叠交互",
	storageKey: "valar.trace-styles.v2",
	group: "轨迹间距",
	parameters: [
		{ kind: "number", key: "gap", label: "列表间距（px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "detailMarginTop", label: "详情上间距（px）", min: 0, max: 24, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--muted-foreground", "轨迹文字"],
		["--destructive", "错误状态"],
		["--border", "树线"],
		["--motion-duration-normal", "全局动效（只读）"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/trace.json`];
		if (!load) throw new Error(`没有 ${style} 的 Trace registry`);
		return parseTraceSource((await load()).files);
	},
	previewCss: (scope, overrides) => traceCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => traceCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: traceOverrideClasses,
};
