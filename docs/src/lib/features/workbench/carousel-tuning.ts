import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z.object({ gap: z.number().int().min(0).max(32).multipleOf(2) }).strict();
export type CarouselValues = z.infer<typeof valuesSchema>;
export type CarouselOverrides = Partial<CarouselValues>;
export type CarouselContext = null;

export function parseCarouselSource(files: { target: string; content: string }[]): {
	values: CarouselValues;
	context: CarouselContext;
} {
	const classes = (file: string, orientation: "horizontal" | "vertical") => {
		const source = files.find((entry) => entry.target.split("/").at(-1) === file)?.content;
		const body = source && /class=\{cn\(([\s\S]*?)\)\}/.exec(source)?.[1];
		if (body === undefined) throw new Error(`Carousel registry 缺少 ${file} 样式`);
		// Resolve BOTH direction-dependent arguments before merging every literal cn argument.
		// Merging the two branches together would silently mix horizontal and vertical defaults.
		const branch = body.replace(
			/emblaCtx\.orientation\s*===\s*"horizontal"\s*\?\s*"([^"]*)"\s*:\s*"([^"]*)"/g,
			(_match, horizontal: string, vertical: string) =>
				JSON.stringify(orientation === "horizontal" ? horizontal : vertical)
		);
		return cn(...[...branch.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	};
	const gaps = [
		sourceWord("-ms-(\\d+(?:\\.5)?)", classes("carousel-content.svelte", "horizontal")),
		sourceWord("-mt-(\\d+(?:\\.5)?)", classes("carousel-content.svelte", "vertical")),
		sourceWord("ps-(\\d+(?:\\.5)?)", classes("carousel-item.svelte", "horizontal")),
		sourceWord("pt-(\\d+(?:\\.5)?)", classes("carousel-item.svelte", "vertical")),
	];
	if (gaps.some((value) => value === undefined || value !== gaps[0]))
		throw new Error("Carousel registry 缺少横纵一致的幻灯片间距");
	return { values: valuesSchema.parse({ gap: Number(gaps[0]) * 4 }), context: null };
}

export function carouselOverrideClasses(overrides: CarouselOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	if (safe.gap === undefined) return {};
	const gap = spacing(safe.gap);
	return {
		"cn-carousel-content-horizontal": `-ms-${gap}`,
		"cn-carousel-content-vertical": `-mt-${gap}`,
		"cn-carousel-item-horizontal": `ps-${gap}`,
		"cn-carousel-item-vertical": `pt-${gap}`,
	};
}

function carouselCss(
	select: (slot: string, orientation: string) => string,
	overrides: CarouselOverrides
): string {
	const safe = valuesSchema.partial().parse(overrides);
	if (safe.gap === undefined) return "";
	return [
		`${select("carousel-container", "horizontal")} { margin-inline-start: -${safe.gap}px; }`,
		`${select("carousel-container", "vertical")} { margin-top: -${safe.gap}px; }`,
		`${select("carousel-item", "horizontal")} { padding-inline-start: ${safe.gap}px; }`,
		`${select("carousel-item", "vertical")} { padding-top: ${safe.gap}px; }`,
	].join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/carousel.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const CAROUSEL_SPEC: TunerSpec<CarouselValues, CarouselContext> = {
	component: "carousel",
	title: "Carousel",
	description: "只调整横纵幻灯片间距；方向、每屏数量、Embla 选项和按钮保持调用处配置",
	storageKey: "valar.carousel-styles.v2",
	group: "幻灯片布局",
	parameters: [{ kind: "number", key: "gap", label: "幻灯片间距（px）", min: 0, max: 32, step: 2 }],
	valuesSchema,
	tokens: [
		["--radius", "卡片与按钮圆角基数"],
		["--border", "卡片与按钮边框"],
		["--foreground", "内容与按钮前景色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/carousel.json`];
		if (!load) throw new Error(`没有 ${style} 的 Carousel registry`);
		return parseCarouselSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		carouselCss(
			(slot, orientation) => `${scope} [data-slot="${slot}"][data-orientation="${orientation}"]`,
			overrides
		),
	pageCss: (overrides) =>
		carouselCss(
			(slot, orientation) =>
				`[data-slot="${slot}"][data-orientation="${orientation}"]${NOT_EDITOR}`,
			overrides
		),
	overrideClasses: carouselOverrideClasses,
};
