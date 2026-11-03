import { cn } from "cn";
import { z } from "zod";
import { spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		horizontalThickness: z.number().int().min(1).max(4),
		verticalThickness: z.number().int().min(1).max(4),
	})
	.strict();
export type ResizableValues = z.infer<typeof valuesSchema>;
export type ResizableOverrides = Partial<ResizableValues>;
export type ResizableContext = null;

/** Aggregate every literal passed to cn, including a later injected override. */
export function parseResizableSource(files: { target: string; content: string }[]): {
	values: ResizableValues;
	context: ResizableContext;
} {
	const source = files.find(
		(file) => file.target.split("/").at(-1) === "resizable-handle.svelte"
	)?.content;
	const handle = /data-slot="resizable-handle"[\s\S]*?class=\{cn\(([\s\S]*?)\)\}/.exec(
		source ?? ""
	)?.[1];
	if (!handle) throw new Error("Resizable registry 缺少分隔把手");
	const classes = cn(...[...handle.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	const read = (utility: string) => {
		const value = classes
			.split(/\s+/)
			.find((word) => word.startsWith(`${utility}-`))
			?.slice(utility.length + 1);
		if (value === "px") return 1;
		if (value !== undefined && /^\d+(?:\.(?:25|5|75))?$/.test(value)) return Number(value) * 4;
		throw new Error(`Resizable registry 缺少 ${utility} 线宽`);
	};
	return {
		values: valuesSchema.parse({
			horizontalThickness: read("w"),
			verticalThickness: read("data-[direction=vertical]:h"),
		}),
		context: null,
	};
}

export function resizableOverrideClasses(overrides: ResizableOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const handle: string[] = [];
	if (safe.horizontalThickness !== undefined) handle.push(`w-${spacing(safe.horizontalThickness)}`);
	if (safe.verticalThickness !== undefined)
		handle.push(`data-[direction=vertical]:h-${spacing(safe.verticalThickness)}`);
	return handle.length ? { "cn-resizable-handle": handle.join(" ") } : {};
}

function resizableCss(select: string, overrides: ResizableOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.horizontalThickness !== undefined)
		rules.push(
			`${select}[data-direction="horizontal"] { width: calc(${spacing(safe.horizontalThickness)} * var(--spacing)); }`
		);
	if (safe.verticalThickness !== undefined)
		rules.push(
			`${select}[data-direction="vertical"] { height: calc(${spacing(safe.verticalThickness)} * var(--spacing)); }`
		);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/resizable.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const RESIZABLE_SPEC: TunerSpec<ResizableValues, ResizableContext> = {
	component: "resizable",
	title: "Resizable",
	description: "只调横纵分栏的分隔线宽；保留触摸命中区、把手外形，比例和容器由调用处决定",
	storageKey: "valar.resizable-styles.v2",
	group: "分隔线几何",
	parameters: [
		{
			kind: "number",
			key: "horizontalThickness",
			label: "左右分栏线宽（px）",
			min: 1,
			max: 4,
			step: 1,
		},
		{
			kind: "number",
			key: "verticalThickness",
			label: "上下分栏线宽（px）",
			min: 1,
			max: 4,
			step: 1,
		},
	],
	valuesSchema,
	tokens: [
		["--border", "分隔线颜色"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/resizable.json`];
		if (!load) throw new Error(`没有 ${style} 的 Resizable registry`);
		return parseResizableSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		resizableCss(`${scope} [data-slot="resizable-handle"]`, overrides),
	pageCss: (overrides) => resizableCss(`[data-slot="resizable-handle"]${NOT_EDITOR}`, overrides),
	overrideClasses: resizableOverrideClasses,
};
