import { z } from "zod";
import {
	MOTION_TIER_LABELS,
	MOTION_TIERS,
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	readSlide,
	slideClasses,
	slideCss,
	SLIDE_DISTANCES,
	SLIDE_OPTIONS,
	sourceWord,
	spacing,
	STYLE_VALUE,
	tierVar,
	ZOOM_LEVELS,
	type RadiusLevel,
	type TunerSpec,
} from "./tuner.js";

// Width, sideOffset and hover delays remain caller props. The content has no flex gap.
const valuesSchema = z
	.object({
		padding: z.number().int().min(4).max(32).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
		duration: z.enum([STYLE_VALUE, ...MOTION_TIERS]),
		zoom: z.enum(ZOOM_LEVELS),
		slide: z.enum(SLIDE_DISTANCES),
	})
	.strict();
export type HoverCardValues = z.infer<typeof valuesSchema>;
export type HoverCardOverrides = Partial<HoverCardValues>;

/** Reads the current style's installed, flattened Hover Card source. */
export function parseHoverCardSource(files: { target: string; content: string }[]): {
	values: HoverCardValues;
	context: null;
} {
	const file = files.find((f) => f.target.endsWith("hover-card-content.svelte"))?.content ?? "";
	const content = /cn\(\s*"([^"]*)"/.exec(file)?.[1] ?? "";
	const padding = sourceWord(String.raw`p-(\d+(?:\.5)?)`, content);
	return {
		values: {
			padding: padding === undefined ? 16 : Number(padding) * 4,
			radius:
				(sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, content) as RadiusLevel | undefined) ??
				STYLE_VALUE,
			duration: (sourceWord("duration-(fast|normal|slow)", content) ??
				STYLE_VALUE) as HoverCardValues["duration"],
			zoom: (/data-open:zoom-in-(\d+)/.exec(content)?.[1] ?? "100") as HoverCardValues["zoom"],
			slide: readSlide(content),
		},
		context: null,
	};
}

const registryHoverCards = import.meta.glob<{
	files: { target: string; content: string }[];
}>("/src/__registry__/json/styles/*/hover-card.json", { import: "default" });

function hoverCardCss(select: string, overrides: HoverCardOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	const rules: string[] = [];
	if (safe.padding !== undefined) content.push(`padding: ${safe.padding}px;`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		content.push(`border-radius: ${radiusCss(safe.radius)};`);
	if (safe.duration !== undefined && safe.duration !== STYLE_VALUE)
		content.push(`animation-duration: ${tierVar(safe.duration)};`);
	if (safe.zoom !== undefined)
		content.push(
			`--tw-enter-scale: ${Number(safe.zoom) / 100}; --tw-exit-scale: ${Number(safe.zoom) / 100};`
		);
	if (safe.slide !== undefined) rules.push(...slideCss((side) => `${select}${side}`, safe.slide));
	if (content.length) rules.unshift(`${select} { ${content.join(" ")} }`);
	return rules.join("\n");
}

const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export function hoverCardOverrideClasses(overrides: HoverCardOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	if (safe.padding !== undefined) content.push(`p-${spacing(safe.padding)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		content.push(`rounded-${safe.radius}`);
	if (safe.duration !== undefined && safe.duration !== STYLE_VALUE)
		content.push(`duration-${safe.duration}`);
	if (safe.zoom !== undefined)
		content.push(`data-open:zoom-in-${safe.zoom}`, `data-closed:zoom-out-${safe.zoom}`);
	if (safe.slide !== undefined) content.push(...slideClasses(safe.slide));
	return content.length ? { "cn-hover-card-content": content.join(" ") } : {};
}

export const HOVER_CARD_SPEC: TunerSpec<HoverCardValues, null> = {
	component: "hover-card",
	title: "Hover Card",
	description: "调整预览卡片的留白、圆角与出现方式；保留当前悬停行为与延迟",
	storageKey: "valar.hover-card-styles.v2",
	group: "布局与动效",
	parameters: [
		{ kind: "number", key: "padding", label: "内边距（px）", min: 4, max: 32, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
		{
			kind: "select",
			key: "duration",
			label: "动效档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...MOTION_TIERS.map((value) => ({ value, label: MOTION_TIER_LABELS[value] })),
			],
		},
		{
			kind: "select",
			key: "zoom",
			label: "出现时缩放",
			options: [
				{ value: "90", label: "90% · 明显" },
				{ value: "95", label: "95% · 轻微" },
				{ value: "100", label: "100% · 不缩放" },
			],
		},
		{ kind: "select", key: "slide", label: "出现时滑入距离", options: SLIDE_OPTIONS },
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--motion-duration-fast", "快档时长"],
		["--motion-duration-normal", "中档时长"],
		["--motion-duration-slow", "慢档时长"],
		["--popover", "卡片背景"],
		["--popover-foreground", "卡片文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryHoverCards[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/hover-card.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Hover Card registry`);
		return parseHoverCardSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		hoverCardCss(`${scope} [data-slot="hover-card-content"]`, overrides),
	pageCss: (overrides) => hoverCardCss(`[data-slot="hover-card-content"]${NOT_EDITOR}`, overrides),
	overrideClasses: (overrides) => hoverCardOverrideClasses(overrides),
};
