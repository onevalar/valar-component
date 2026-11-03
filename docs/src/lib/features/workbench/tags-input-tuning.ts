import { cn } from "cn";
import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	sourceWord,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		padding: z.number().int().min(0).max(16).multipleOf(2),
		gap: z.number().int().min(0).max(16).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type TagsInputValues = z.infer<typeof valuesSchema>;
export type TagsInputOverrides = Partial<TagsInputValues>;
export type TagsInputContext = null;

/** Resolve every literal cn argument in order, so installed overrides beat source defaults. */
export function parseTagsInputSource(files: { target: string; content: string }[]): {
	values: TagsInputValues;
	context: TagsInputContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "tags-input.svelte")?.content ?? "";
	const literals = /data-slot="tags-input"[\s\S]*?class=\{cn\(\s*((?:"[^"]*"\s*,?\s*)+)/.exec(
		source
	)?.[1];
	if (literals === undefined) throw new Error("Tags Input registry 缺少外层样式入口");
	const classes = cn(...Array.from(literals.matchAll(/"([^"]*)"/g), (match) => match[1]));
	const pixels = (utility: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, classes);
		if (value === undefined) throw new Error(`Tags Input registry 缺少 ${utility} 几何`);
		return Number(value) * 4;
	};
	const radius = sourceWord("rounded-([^ ]+)", classes);
	if (radius === undefined) throw new Error("Tags Input registry 缺少外层圆角");
	return {
		values: valuesSchema.parse({
			padding: pixels("p"),
			gap: pixels("gap"),
			radius: RADIUS_CHOICES.find((value) => value === radius) ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function tagsInputOverrideClasses(overrides: TagsInputOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	if (safe.padding !== undefined) classes.push(`p-${spacing(safe.padding)}`);
	if (safe.gap !== undefined) classes.push(`gap-${spacing(safe.gap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		classes.push(`rounded-${safe.radius}`);
	return classes.length ? { "cn-tags-input": classes.join(" ") } : {};
}

function tagsInputCss(select: string, overrides: TagsInputOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.padding !== undefined) rules.push(`${select} { padding: ${safe.padding}px; }`);
	if (safe.gap !== undefined) rules.push(`${select} { gap: ${safe.gap}px; }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		rules.push(`${select} { border-radius: ${radiusCss(safe.radius)}; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/tags-input.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const TAGS_INPUT_SPEC: TunerSpec<TagsInputValues, TagsInputContext> = {
	component: "tags-input",
	title: "Tags Input",
	description: "只调整外层留白、标签间距与根圆角；保留输入法、换行、删除、校验和表单行为",
	storageKey: "valar.tags-input-styles.v2",
	group: "外层留白与圆角",
	parameters: [
		{ kind: "number", key: "padding", label: "外层留白（px）", min: 0, max: 16, step: 2 },
		{ kind: "number", key: "gap", label: "标签间距（px）", min: 0, max: 16, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "根圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--text-sm", "标签与输入字号"],
		["--background", "输入背景色"],
		["--foreground", "文字色"],
		["--secondary", "标签背景色"],
		["--secondary-foreground", "标签文字色"],
		["--input", "输入边框色"],
		["--ring", "焦点环"],
		["--destructive", "校验错误色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/tags-input.json`];
		if (!load) throw new Error(`没有 ${style} 的 Tags Input registry`);
		return parseTagsInputSource((await load()).files);
	},
	previewCss: (scope, overrides) => tagsInputCss(`${scope} [data-slot="tags-input"]`, overrides),
	pageCss: (overrides) => tagsInputCss(`[data-slot="tags-input"]${NOT_EDITOR}`, overrides),
	overrideClasses: tagsInputOverrideClasses,
};
