import { cn } from "cn";
import { z } from "zod";
import { spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		contentGap: z.number().int().min(0).max(16).multipleOf(2),
		ellipsisSize: z.number().int().min(20).max(48).multipleOf(2),
	})
	.strict();
export type PaginationValues = z.infer<typeof valuesSchema>;
export type PaginationOverrides = Partial<PaginationValues>;
export type PaginationContext = null;

function sourceClasses(files: { target: string; content: string }[], name: string): string[] {
	const content = files.find((file) => file.target.split("/").at(-1) === `${name}.svelte`)?.content;
	const args = /cn\(\s*((?:"(?:\\.|[^"\\])*"\s*,\s*)+)/.exec(content ?? "")?.[1];
	if (args === undefined) throw new Error(`Pagination registry 缺少 ${name} 样式`);
	return cn(
		...[...args.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([literal]) => JSON.parse(literal))
	).split(/\s+/);
}

export function parsePaginationSource(files: { target: string; content: string }[]): {
	values: PaginationValues;
	context: PaginationContext;
} {
	const read = (name: string, utility: string) => {
		const value = sourceClasses(files, name).find((word) =>
			new RegExp(`^${utility}-\\d+(?:\\.5)?$`).test(word)
		);
		if (value === undefined) throw new Error(`Pagination registry 缺少 ${name} 的 ${utility}`);
		return Number(value.slice(utility.length + 1)) * 4;
	};
	return {
		values: valuesSchema.parse({
			contentGap: read("pagination-content", "gap"),
			ellipsisSize: read("pagination-ellipsis", "size"),
		}),
		context: null,
	};
}

export function paginationOverrideClasses(overrides: PaginationOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return {
		...(safe.contentGap !== undefined
			? { "cn-pagination-content": `gap-${spacing(safe.contentGap)}` }
			: {}),
		...(safe.ellipsisSize !== undefined
			? { "cn-pagination-ellipsis": `size-${spacing(safe.ellipsisSize)}` }
			: {}),
	};
}

function paginationCss(select: (slot: string) => string, overrides: PaginationOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.contentGap !== undefined)
		rules.push(`${select("pagination-content")} { gap: ${safe.contentGap}px; }`);
	if (safe.ellipsisSize !== undefined)
		rules.push(
			`${select("pagination-ellipsis")} { width: ${safe.ellipsisSize}px; height: ${safe.ellipsisSize}px; }`
		);
	return rules.join("\n");
}

const registryPaginations = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/pagination.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const PAGINATION_SPEC: TunerSpec<PaginationValues, PaginationContext> = {
	component: "pagination",
	title: "Pagination",
	description: "只调内容间距和省略号占位尺寸；页码与前后按钮继续复用 Button 高度，不改分页逻辑",
	storageKey: "valar.pagination-styles.v2",
	group: "分页组合几何",
	parameters: [
		{ kind: "number", key: "contentGap", label: "内容间距（px）", min: 0, max: 16, step: 2 },
		{
			kind: "number",
			key: "ellipsisSize",
			label: "省略号占位尺寸（px）",
			min: 20,
			max: 48,
			step: 2,
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "Button 圆角基数"],
		["--text-sm", "按钮文字"],
		["--foreground", "文字色"],
		["--border", "当前页边框"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryPaginations[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/pagination.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Pagination registry`);
		return parsePaginationSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		paginationCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => paginationCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: paginationOverrideClasses,
};
