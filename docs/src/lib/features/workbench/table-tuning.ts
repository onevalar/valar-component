import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		headHeight: z.number().int().min(24).max(64).multipleOf(2),
		headPaddingX: z.number().int().min(0).max(32).multipleOf(2),
		cellPaddingX: z.number().int().min(0).max(32).multipleOf(2),
		cellPaddingY: z.number().int().min(0).max(24).multipleOf(2),
	})
	.strict();
export type TableValues = z.infer<typeof valuesSchema>;
export type TableOverrides = Partial<TableValues>;

/** Table-cell height is a lower bound; taller content must still fit naturally. */
export function parseTableSource(files: { target: string; content: string }[]): {
	values: TableValues;
	context: null;
} {
	const classes = (name: string) => {
		const file = files.find((file) => file.target.split("/").at(-1) === `${name}.svelte`);
		const value = /cn\(\s*"([^"]*)"/.exec(file?.content ?? "")?.[1];
		if (value === undefined) throw new Error(`Table registry 缺少 ${name} 的样式`);
		return value;
	};
	const head = classes("table-head");
	const cell = classes("table-cell");
	const pixels = (source: string, utility: string, fallback?: string) => {
		const read = (name: string) => sourceWord(`${name}-(\\d+(?:\\.\\d+)?)`, source);
		const value = read(utility) ?? (fallback ? read(fallback) : undefined);
		if (value === undefined) throw new Error(`Table registry 缺少 ${utility} 留白或高度`);
		return Number(value) * 4;
	};
	return {
		values: valuesSchema.parse({
			headHeight: pixels(head, "h"),
			headPaddingX: pixels(head, "px", "p"),
			cellPaddingX: pixels(cell, "px", "p"),
			cellPaddingY: pixels(cell, "py", "p"),
		}),
		context: null,
	};
}

export function tableOverrideClasses(overrides: TableOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const head: string[] = [];
	const cell: string[] = [];
	if (safe.headHeight !== undefined) head.push(`h-${spacing(safe.headHeight)}`);
	if (safe.headPaddingX !== undefined) head.push(`px-${spacing(safe.headPaddingX)}`);
	if (safe.cellPaddingX !== undefined) cell.push(`px-${spacing(safe.cellPaddingX)}`);
	if (safe.cellPaddingY !== undefined) cell.push(`py-${spacing(safe.cellPaddingY)}`);
	return {
		...(head.length ? { "cn-table-head": head.join(" ") } : {}),
		...(cell.length ? { "cn-table-cell": cell.join(" ") } : {}),
	};
}

function tableCss(select: (slot: string) => string, overrides: TableOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const head = select("table-head");
	const cell = select("table-cell");
	const rules: string[] = [];
	if (safe.headHeight !== undefined) rules.push(`${head} { height: ${safe.headHeight}px; }`);
	if (safe.headPaddingX !== undefined)
		rules.push(
			`${head} { padding-left: ${safe.headPaddingX}px; padding-right: ${safe.headPaddingX}px; }`,
			`${head}:has([role="checkbox"]) { padding-right: 0; }`
		);
	if (safe.cellPaddingX !== undefined)
		rules.push(
			`${cell} { padding-left: ${safe.cellPaddingX}px; padding-right: ${safe.cellPaddingX}px; }`,
			`${cell}:has([role="checkbox"]) { padding-right: 0; }`
		);
	if (safe.cellPaddingY !== undefined)
		rules.push(
			`${cell} { padding-top: ${safe.cellPaddingY}px; padding-bottom: ${safe.cellPaddingY}px; }`
		);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/table.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const TABLE_SPEC: TunerSpec<TableValues, null> = {
	component: "table",
	title: "Table",
	description: "只调基础表格密度；保留语义结构、嵌入控件留白与容器横向滚动",
	storageKey: "valar.table-styles.v2",
	group: "表头与数据格密度",
	parameters: [
		{ kind: "number", key: "headHeight", label: "表头高度下限（px）", min: 24, max: 64, step: 2 },
		{ kind: "number", key: "headPaddingX", label: "表头横向留白（px）", min: 0, max: 32, step: 2 },
		{
			kind: "number",
			key: "cellPaddingX",
			label: "数据格横向留白（px）",
			min: 0,
			max: 32,
			step: 2,
		},
		{
			kind: "number",
			key: "cellPaddingY",
			label: "数据格纵向留白（px）",
			min: 0,
			max: 24,
			step: 2,
		},
	],
	valuesSchema,
	tokens: [
		["--text-sm", "表格字号"],
		["--border", "分隔线"],
		["--muted", "弱化背景"],
		["--muted-foreground", "说明文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/table.json`];
		if (!load) throw new Error(`没有 ${style} 的 Table registry`);
		return parseTableSource((await load()).files);
	},
	previewCss: (scope, overrides) => tableCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => tableCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: tableOverrideClasses,
};
