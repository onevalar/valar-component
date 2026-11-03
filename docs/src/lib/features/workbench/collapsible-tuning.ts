import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

export const collapsibleValuesSchema = z
	.object({
		paddingX: z.number().int().min(0).max(32).multipleOf(2),
		paddingY: z.number().int().min(0).max(32).multipleOf(2),
	})
	.strict();
export const collapsibleOverridesSchema = collapsibleValuesSchema.partial();
export type CollapsibleValues = z.infer<typeof collapsibleValuesSchema>;
export type CollapsibleOverrides = Partial<CollapsibleValues>;
export type CollapsibleContext = null;

/** No padding is a real zero baseline, not a guessed style's defaults. */
export function parseCollapsibleSource(files: { target: string; content: string }[]): {
	values: CollapsibleValues;
	context: CollapsibleContext;
} {
	const source = files.find(
		(file) => file.target.split("/").at(-1) === "collapsible-content.svelte"
	)?.content;
	const tag = /<CollapsiblePrimitive\.Content\b[\s\S]*?\/>/.exec(source ?? "")?.[0];
	if (!tag?.includes('data-slot="collapsible-content"') || !tag.includes("{...restProps}"))
		throw new Error("Collapsible registry 缺少内容原语入口");
	const args = /class=\{cn\(([\s\S]*?)\)\}/.exec(tag)?.[1];
	// Older flattened registries have no class prop; a new unedited anchor flattens to cn(className).
	if (
		(args === undefined && /\bclass\s*=/.test(tag)) ||
		(args !== undefined && !/^\s*(?:"[^"]*"\s*,\s*)*className\s*$/.test(args))
	)
		throw new Error("Collapsible registry 内容样式入口不可读取");
	const classes = cn(...[...(args ?? "").matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	if (
		classes
			.split(/\s+/)
			.some(
				(token) =>
					/^(?:p|px|py|pt|pb|pl|pr|ps|pe)-/.test(token) && !/^p[xy]-\d+(?:\.5)?$/.test(token)
			)
	)
		throw new Error("Collapsible registry 包含不支持的内容留白");
	return {
		values: collapsibleValuesSchema.parse({
			paddingX: Number(sourceWord("px-(\\d+(?:\\.5)?)", classes) ?? 0) * 4,
			paddingY: Number(sourceWord("py-(\\d+(?:\\.5)?)", classes) ?? 0) * 4,
		}),
		context: null,
	};
}

export function collapsibleOverrideClasses(
	overrides: CollapsibleOverrides
): Record<string, string> {
	const safe = collapsibleOverridesSchema.parse(overrides);
	const classes = [
		safe.paddingX !== undefined ? `px-${spacing(safe.paddingX)}` : "",
		safe.paddingY !== undefined ? `py-${spacing(safe.paddingY)}` : "",
	].filter(Boolean);
	return classes.length ? { "cn-collapsible-content-geometry": classes.join(" ") } : {};
}

function collapsibleCss(select: string, overrides: CollapsibleOverrides): string {
	const safe = collapsibleOverridesSchema.parse(overrides);
	return [
		safe.paddingX !== undefined
			? `${select} { padding-inline: calc(${spacing(safe.paddingX)} * var(--spacing)); }`
			: "",
		safe.paddingY !== undefined
			? `${select} { padding-block: calc(${spacing(safe.paddingY)} * var(--spacing)); }`
			: "",
	]
		.filter(Boolean)
		.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/collapsible.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const COLLAPSIBLE_SPEC: TunerSpec<CollapsibleValues, CollapsibleContext> = {
	component: "collapsible",
	title: "Collapsible",
	description: "按需增加内容留白，默认仍无样式；保留展开、禁用和调用处布局，不新增背景或边框",
	storageKey: "valar.collapsible-styles.v2",
	group: "可选内容留白",
	parameters: [
		{ kind: "number", key: "paddingX", label: "内容横向留白（px 基准）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "paddingY", label: "内容纵向留白（px 基准）", min: 0, max: 32, step: 2 },
	],
	valuesSchema: collapsibleValuesSchema,
	tokens: [
		["--spacing", "间距基数"],
		["--foreground", "文字色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/collapsible.json`];
		if (!load) throw new Error(`没有 ${style} 的 Collapsible registry`);
		return parseCollapsibleSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		collapsibleCss(`${scope} [data-slot="collapsible-content"]`, overrides),
	pageCss: (overrides) =>
		collapsibleCss(`[data-slot="collapsible-content"]${NOT_EDITOR}`, overrides),
	overrideClasses: collapsibleOverrideClasses,
};
