import { cn } from "cn";
import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	STYLE_VALUE,
	radiusCss,
	sourceWord,
	spacing,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		verticalThickness: z.number().int().min(6).max(24).multipleOf(2),
		horizontalThickness: z.number().int().min(6).max(24).multipleOf(2),
		thumbRadius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type ScrollAreaValues = z.infer<typeof valuesSchema>;
export type ScrollAreaOverrides = Partial<ScrollAreaValues>;
export type ScrollAreaContext = null;

export function parseScrollAreaSource(files: { target: string; content: string }[]): {
	values: ScrollAreaValues;
	context: ScrollAreaContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "scroll-area-scrollbar.svelte")
			?.content ?? "";
	const bar = /data-slot="scroll-area-scrollbar"[\s\S]*?class=\{cn\(([\s\S]*?)\)\}/.exec(
		source
	)?.[1];
	const thumb =
		/data-slot="scroll-area-thumb"[\s\S]*?class=(?:"([^"]*)"|\{cn\(([\s\S]*?)\)\})/.exec(source);
	if (!bar || !thumb) throw new Error("Scroll Area registry 缺少滚动条或滑块");
	const literals = (expression: string) =>
		cn(...[...expression.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	const classes = literals(bar);
	const thumbClasses = thumb[1] === undefined ? literals(thumb[2]) : cn(thumb[1]);
	const width = sourceWord("data-vertical:w-(\\d+(?:\\.5)?)", classes);
	const height = sourceWord("data-horizontal:h-(\\d+(?:\\.5)?)", classes);
	if (width === undefined || height === undefined)
		throw new Error("Scroll Area registry 缺少横纵滚动条宽度");
	return {
		values: valuesSchema.parse({
			verticalThickness: Number(width) * 4,
			horizontalThickness: Number(height) * 4,
			thumbRadius: sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, thumbClasses) ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function scrollAreaOverrideClasses(overrides: ScrollAreaOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const bar: string[] = [];
	if (safe.verticalThickness !== undefined)
		bar.push(`data-vertical:w-${spacing(safe.verticalThickness)}`);
	if (safe.horizontalThickness !== undefined)
		bar.push(`data-horizontal:h-${spacing(safe.horizontalThickness)}`);
	return {
		...(bar.length ? { "cn-scroll-area-scrollbar": bar.join(" ") } : {}),
		...(safe.thumbRadius !== undefined && safe.thumbRadius !== STYLE_VALUE
			? { "cn-scroll-area-thumb": `rounded-${safe.thumbRadius}` }
			: {}),
	};
}

function scrollAreaCss(select: (slot: string) => string, overrides: ScrollAreaOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.verticalThickness !== undefined)
		rules.push(
			`${select("scroll-area-scrollbar")}[data-orientation="vertical"] { width: calc(${spacing(safe.verticalThickness)} * var(--spacing)); }`
		);
	if (safe.horizontalThickness !== undefined)
		rules.push(
			`${select("scroll-area-scrollbar")}[data-orientation="horizontal"] { height: calc(${spacing(safe.horizontalThickness)} * var(--spacing)); }`
		);
	if (safe.thumbRadius !== undefined && safe.thumbRadius !== STYLE_VALUE)
		rules.push(`${select("scroll-area-thumb")} { border-radius: ${radiusCss(safe.thumbRadius)}; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/scroll-area.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const SCROLL_AREA_SPEC: TunerSpec<ScrollAreaValues, ScrollAreaContext> = {
	component: "scroll-area",
	title: "Scroll Area",
	description: "只调横纵滚动条厚度与滑块圆角；容器尺寸、溢出方向及滚动行为由调用处决定",
	storageKey: "valar.scroll-area-styles.v2",
	group: "滚动条几何",
	parameters: [
		{
			kind: "number",
			key: "verticalThickness",
			label: "纵向滚动条宽（px）",
			min: 6,
			max: 24,
			step: 2,
		},
		{
			kind: "number",
			key: "horizontalThickness",
			label: "横向滚动条高（px）",
			min: 6,
			max: 24,
			step: 2,
		},
		{
			kind: "select",
			key: "thumbRadius",
			label: "滑块圆角",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--border", "滑块颜色"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/scroll-area.json`];
		if (!load) throw new Error(`没有 ${style} 的 Scroll Area registry`);
		return parseScrollAreaSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		scrollAreaCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => scrollAreaCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: scrollAreaOverrideClasses,
};
