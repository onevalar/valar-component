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

const valuesSchema = z.object({ radius: z.enum(RADIUS_CHOICES) }).strict();
export type SkeletonValues = z.infer<typeof valuesSchema>;
export type SkeletonOverrides = Partial<SkeletonValues>;
export type SkeletonContext = null;

export function parseSkeletonSource(files: { target: string; content: string }[]): {
	values: SkeletonValues;
	context: SkeletonContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "skeleton.svelte")?.content ?? "";
	const root = /data-slot="skeleton"[\s\S]*?class=\{cn\(([\s\S]*?)\)\}/.exec(source)?.[1];
	if (root === undefined) throw new Error("Skeleton registry 缺少根样式");
	const classes = cn(...[...root.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	return {
		values: valuesSchema.parse({
			radius: sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, classes) ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function skeletonOverrideClasses(overrides: SkeletonOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return safe.radius !== undefined && safe.radius !== STYLE_VALUE
		? { "cn-skeleton": `rounded-${safe.radius}` }
		: {};
}

function skeletonCss(select: string, overrides: SkeletonOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	return safe.radius !== undefined && safe.radius !== STYLE_VALUE
		? `${select} { border-radius: ${radiusCss(safe.radius)}; }`
		: "";
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/skeleton.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const SKELETON_SPEC: TunerSpec<SkeletonValues, SkeletonContext> = {
	component: "skeleton",
	title: "Skeleton",
	description: "只调整占位圆角；宽高由最终内容决定，保留颜色与原有动画",
	storageKey: "valar.skeleton-styles.v2",
	group: "占位形状",
	parameters: [
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--muted", "占位背景"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/skeleton.json`];
		if (!load) throw new Error(`没有 ${style} 的 Skeleton registry`);
		return parseSkeletonSource((await load()).files);
	},
	previewCss: (scope, overrides) => skeletonCss(`${scope} [data-slot="skeleton"]`, overrides),
	pageCss: (overrides) => skeletonCss(`[data-slot="skeleton"]${NOT_EDITOR}`, overrides),
	overrideClasses: skeletonOverrideClasses,
};
