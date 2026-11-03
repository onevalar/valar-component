import { cn } from "cn";
import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	sourceWord,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

export const aspectRatioValuesSchema = z
	.object({
		radius: z.enum(RADIUS_CHOICES),
		clipping: z.enum([STYLE_VALUE, "hidden", "visible"]),
	})
	.strict();
export const aspectRatioOverridesSchema = aspectRatioValuesSchema.partial();
export type AspectRatioValues = z.infer<typeof aspectRatioValuesSchema>;
export type AspectRatioOverrides = Partial<AspectRatioValues>;
export type AspectRatioContext = null;

export function parseAspectRatioSource(files: { target: string; content: string }[]): {
	values: AspectRatioValues;
	context: AspectRatioContext;
} {
	const source = files.find(
		(file) => file.target.split("/").at(-1) === "aspect-ratio.svelte"
	)?.content;
	const tag = /<AspectRatioPrimitive\.Root\b[\s\S]*?\/>/.exec(source ?? "")?.[0];
	if (!tag?.includes('data-slot="aspect-ratio"') || !tag.includes("{...restProps}"))
		throw new Error("Aspect Ratio registry 缺少宽高比原语入口");
	const args = /class=\{cn\(([\s\S]*?)\)\}/.exec(tag)?.[1];
	if (
		(args === undefined && /\bclass\s*=/.test(tag)) ||
		(args !== undefined && !/^\s*(?:"[^"]*"\s*,\s*)*className\s*$/.test(args))
	)
		throw new Error("Aspect Ratio registry 样式入口不可读取");
	const classes = cn(...[...(args ?? "").matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	const radius = sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, classes);
	const clipping = sourceWord("overflow-(hidden|visible)", classes);
	if ((!radius && /\brounded(?:-|\b)/.test(classes)) || (!clipping && /\boverflow-/.test(classes)))
		throw new Error("Aspect Ratio registry 包含不支持的圆角或裁切");
	return {
		values: aspectRatioValuesSchema.parse({
			radius: radius ?? STYLE_VALUE,
			clipping: clipping ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function aspectRatioOverrideClasses(
	overrides: AspectRatioOverrides
): Record<string, string> {
	const safe = aspectRatioOverridesSchema.parse(overrides);
	const classes = [
		safe.radius !== undefined && safe.radius !== STYLE_VALUE ? `rounded-${safe.radius}` : "",
		safe.clipping !== undefined && safe.clipping !== STYLE_VALUE ? `overflow-${safe.clipping}` : "",
	].filter(Boolean);
	return classes.length ? { "cn-aspect-ratio-geometry": classes.join(" ") } : {};
}

function aspectRatioCss(select: string, overrides: AspectRatioOverrides): string {
	const safe = aspectRatioOverridesSchema.parse(overrides);
	return [
		safe.radius !== undefined && safe.radius !== STYLE_VALUE
			? `${select} { border-radius: ${radiusCss(safe.radius)}; }`
			: "",
		safe.clipping !== undefined && safe.clipping !== STYLE_VALUE
			? `${select} { overflow: ${safe.clipping}; }`
			: "",
	]
		.filter(Boolean)
		.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/aspect-ratio.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const ASPECT_RATIO_SPEC: TunerSpec<AspectRatioValues, AspectRatioContext> = {
	component: "aspect-ratio",
	title: "Aspect Ratio",
	description: "仅按需调整媒体容器圆角与裁切，默认无样式；宽高比属于使用场景，不保存为全局样式",
	storageKey: "valar.aspect-ratio-styles.v2",
	group: "可选媒体边界",
	parameters: [
		{
			kind: "select",
			key: "radius",
			label: "容器圆角",
			options: [
				{ value: STYLE_VALUE, label: "样式自带（未设置）" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
		{
			kind: "select",
			key: "clipping",
			label: "内容裁切",
			options: [
				{ value: STYLE_VALUE, label: "样式自带（未设置）" },
				{ value: "hidden", label: "裁切溢出内容" },
				{ value: "visible", label: "允许溢出" },
			],
		},
	],
	valuesSchema: aspectRatioValuesSchema,
	tokens: [["--radius", "圆角基数"]],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/aspect-ratio.json`];
		if (!load) throw new Error(`没有 ${style} 的 Aspect Ratio registry`);
		return parseAspectRatioSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		aspectRatioCss(`${scope} [data-slot="aspect-ratio"]`, overrides),
	pageCss: (overrides) => aspectRatioCss(`[data-slot="aspect-ratio"]${NOT_EDITOR}`, overrides),
	overrideClasses: aspectRatioOverrideClasses,
};
