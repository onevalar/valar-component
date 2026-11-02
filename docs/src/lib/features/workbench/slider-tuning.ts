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
		trackThickness: z.number().int().min(2).max(16).multipleOf(2),
		thumbSize: z.number().int().min(12).max(32).multipleOf(2),
		trackRadius: z.enum(RADIUS_CHOICES),
		thumbRadius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type SliderValues = z.infer<typeof valuesSchema>;
export type SliderOverrides = Partial<SliderValues>;
/** Luma's long side stays 8px longer in both orientations, including after repeated writes. */
export type SliderContext = { thumbSizeDelta: 0 | 8 };

/** Read the actual installed utilities, not a style-name table or hard-coded default. */
export function parseSliderSource(files: { target: string; content: string }[]): {
	values: SliderValues;
	context: SliderContext;
} {
	const file =
		files.find((file) => file.target.split("/").at(-1) === "slider.svelte")?.content ?? "";
	const track = /data-slot="slider-track"[\s\S]*?class=\{cn\(\s*"([^"]*)"/.exec(file)?.[1] ?? "";
	const thumb = /data-slot="slider-thumb"[\s\S]*?class="([^"]*)"/.exec(file)?.[1] ?? "";
	const readSize = (classes: string, utility: string): number | undefined => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, classes);
		return value === undefined ? undefined : Number(value) * 4;
	};
	const thickness = readSize(track, "data-horizontal:h");
	const verticalThickness = readSize(track, "data-vertical:w");
	const size = readSize(thumb, "size");
	const height = readSize(thumb, "h") ?? size;
	const width = readSize(thumb, "w") ?? size;
	const verticalHeight = readSize(thumb, "data-vertical:h") ?? height;
	const verticalWidth = readSize(thumb, "data-vertical:w") ?? width;
	if (
		thickness === undefined ||
		thickness !== verticalThickness ||
		height === undefined ||
		width === undefined ||
		verticalHeight === undefined ||
		verticalWidth !== height ||
		verticalHeight !== width
	)
		throw new Error("Slider registry 缺少尺寸，或横纵向几何不一致");
	const thumbSizeDelta = z.union([z.literal(0), z.literal(8)]).parse(width - height);
	const radius = (classes: string) =>
		sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, classes) ?? STYLE_VALUE;
	return {
		values: valuesSchema.parse({
			trackThickness: thickness,
			thumbSize: height,
			trackRadius: radius(track),
			thumbRadius: radius(thumb),
		}),
		context: { thumbSizeDelta },
	};
}

function thumbLongSide(size: number, context: SliderContext): number {
	const delta = z.union([z.literal(0), z.literal(8)]).parse(context.thumbSizeDelta);
	return size + delta;
}

export function sliderOverrideClasses(
	overrides: SliderOverrides,
	context: SliderContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const track: string[] = [];
	const thumb: string[] = [];
	if (safe.trackThickness !== undefined) {
		const value = spacing(safe.trackThickness);
		track.push(`data-horizontal:h-${value}`, `data-vertical:w-${value}`);
	}
	if (safe.thumbSize !== undefined) {
		const short = spacing(safe.thumbSize);
		const long = spacing(thumbLongSide(safe.thumbSize, context));
		if (short === long) thumb.push(`size-${short}`);
		else
			thumb.push(`h-${short}`, `w-${long}`, `data-vertical:h-${long}`, `data-vertical:w-${short}`);
	}
	if (safe.trackRadius !== undefined && safe.trackRadius !== STYLE_VALUE)
		track.push(`rounded-${safe.trackRadius}`);
	if (safe.thumbRadius !== undefined && safe.thumbRadius !== STYLE_VALUE)
		thumb.push(`rounded-${safe.thumbRadius}`);
	return {
		...(track.length ? { "cn-slider-track": track.join(" ") } : {}),
		...(thumb.length ? { "cn-slider-thumb": thumb.join(" ") } : {}),
	};
}

function sliderCss(
	select: (slot: string) => string,
	overrides: SliderOverrides,
	context: SliderContext
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.trackThickness !== undefined)
		rules.push(
			`${select("slider-track")}[data-orientation="horizontal"] { height: ${safe.trackThickness}px; }`,
			`${select("slider-track")}[data-orientation="vertical"] { width: ${safe.trackThickness}px; }`
		);
	if (safe.thumbSize !== undefined) {
		const long = thumbLongSide(safe.thumbSize, context);
		rules.push(
			`${select("slider-thumb")}[data-orientation="horizontal"] { height: ${safe.thumbSize}px; width: ${long}px; }`,
			`${select("slider-thumb")}[data-orientation="vertical"] { height: ${long}px; width: ${safe.thumbSize}px; }`
		);
	}
	if (safe.trackRadius !== undefined && safe.trackRadius !== STYLE_VALUE)
		rules.push(`${select("slider-track")} { border-radius: ${radiusCss(safe.trackRadius)}; }`);
	if (safe.thumbRadius !== undefined && safe.thumbRadius !== STYLE_VALUE)
		rules.push(`${select("slider-thumb")} { border-radius: ${radiusCss(safe.thumbRadius)}; }`);
	return rules.join("\n");
}

const registrySliders = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/slider.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
const radiusOptions = [
	{ value: STYLE_VALUE, label: "样式自带" },
	...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
];

export const SLIDER_SPEC: TunerSpec<SliderValues, SliderContext> = {
	component: "slider",
	title: "Slider",
	description: "调整轨道与把手几何，保留各样式形状差异；方向、取值范围与步长仍由调用处决定",
	storageKey: "valar.slider-styles.v2",
	group: "轨道与把手",
	parameters: [
		{ kind: "number", key: "trackThickness", label: "轨道粗细（px）", min: 2, max: 16, step: 2 },
		{ kind: "number", key: "thumbSize", label: "把手短边（px）", min: 12, max: 32, step: 2 },
		{ kind: "select", key: "trackRadius", label: "轨道圆角档位", options: radiusOptions },
		{ kind: "select", key: "thumbRadius", label: "把手圆角档位", options: radiusOptions },
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--primary", "已选轨道与把手"],
		["--muted", "未选轨道"],
		["--input", "轨道背景"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registrySliders[`/src/__registry__/json/styles/${style.replace("style-", "")}/slider.json`];
		if (!load) throw new Error(`没有 ${style} 的 Slider registry`);
		return parseSliderSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		sliderCss((slot) => `${scope} [data-slot="${slot}"]`, overrides, context),
	pageCss: (overrides, context) =>
		sliderCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: sliderOverrideClasses,
};
