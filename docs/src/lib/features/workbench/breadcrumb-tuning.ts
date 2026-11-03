import { cn } from "cn";
import { z } from "zod";
import { spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		listGap: z.number().int().min(0).max(24).multipleOf(2),
		wideListGap: z.number().int().min(0).max(24).multipleOf(2),
		itemGap: z.number().int().min(0).max(16).multipleOf(2),
	})
	.strict();
export type BreadcrumbValues = z.infer<typeof valuesSchema>;
export type BreadcrumbOverrides = Partial<BreadcrumbValues>;
export type BreadcrumbContext = null;

function sourceClasses(files: { target: string; content: string }[], name: string): string[] {
	const content = files.find((file) => file.target.split("/").at(-1) === `${name}.svelte`)?.content;
	const args = /cn\(\s*((?:"(?:\\.|[^"\\])*"\s*,\s*)+)/.exec(content ?? "")?.[1];
	if (args === undefined) throw new Error(`Breadcrumb registry 缺少 ${name} 样式`);
	return cn(
		...[...args.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([literal]) => JSON.parse(literal))
	).split(/\s+/);
}

export function parseBreadcrumbSource(files: { target: string; content: string }[]): {
	values: BreadcrumbValues;
	context: BreadcrumbContext;
} {
	const list = sourceClasses(files, "breadcrumb-list");
	const item = sourceClasses(files, "breadcrumb-item");
	const read = (words: string[], prefix: string): number | undefined => {
		const value = words.find((word) => new RegExp(`^${prefix}gap-\\d+(?:\\.5)?$`).test(word));
		return value === undefined ? undefined : Number(value.slice(`${prefix}gap-`.length)) * 4;
	};
	// No sm utility means CSS inherits the actual base gap, not a style-name default.
	const base = read(list, "");
	return {
		values: valuesSchema.parse({
			listGap: read(list, "max-sm:") ?? base,
			wideListGap: read(list, "sm:") ?? base,
			itemGap: read(item, ""),
		}),
		context: null,
	};
}

export function breadcrumbOverrideClasses(overrides: BreadcrumbOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const list: string[] = [];
	// Independent ranges preserve each style's existing responsive gap when only one is edited.
	if (safe.listGap !== undefined) list.push(`max-sm:gap-${spacing(safe.listGap)}`);
	if (safe.wideListGap !== undefined) list.push(`sm:gap-${spacing(safe.wideListGap)}`);
	return {
		...(list.length ? { "cn-breadcrumb-list": list.join(" ") } : {}),
		...(safe.itemGap !== undefined ? { "cn-breadcrumb-item": `gap-${spacing(safe.itemGap)}` } : {}),
	};
}

function breadcrumbCss(select: (slot: string) => string, overrides: BreadcrumbOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.listGap !== undefined)
		rules.push(
			`@media (width < 40rem) { ${select("breadcrumb-list")} { gap: ${safe.listGap}px; } }`
		);
	if (safe.wideListGap !== undefined)
		rules.push(
			`@media (width >= 40rem) { ${select("breadcrumb-list")} { gap: ${safe.wideListGap}px; } }`
		);
	if (safe.itemGap !== undefined)
		rules.push(`${select("breadcrumb-item")} { gap: ${safe.itemGap}px; }`);
	return rules.join("\n");
}

const registryBreadcrumbs = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/breadcrumb.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const BREADCRUMB_SPEC: TunerSpec<BreadcrumbValues, BreadcrumbContext> = {
	component: "breadcrumb",
	title: "Breadcrumb",
	description: "只调窄／宽屏列表间距和项目内部间距；保留导航、当前页、分隔和省略语义",
	storageKey: "valar.breadcrumb-styles.v2",
	group: "路径间距",
	parameters: [
		{ kind: "number", key: "listGap", label: "窄屏列表间距（px）", min: 0, max: 24, step: 2 },
		{
			kind: "number",
			key: "wideListGap",
			label: "宽屏列表间距（≥640px）",
			min: 0,
			max: 24,
			step: 2,
		},
		{ kind: "number", key: "itemGap", label: "项目内部间距（px）", min: 0, max: 16, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--foreground", "当前页文字"],
		["--muted-foreground", "路径文字"],
		["--text-sm", "小号字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryBreadcrumbs[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/breadcrumb.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Breadcrumb registry`);
		return parseBreadcrumbSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		breadcrumbCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => breadcrumbCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: breadcrumbOverrideClasses,
};
