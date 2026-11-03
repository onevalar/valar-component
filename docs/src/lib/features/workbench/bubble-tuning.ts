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
		paddingX: z.number().int().min(0).max(32).multipleOf(2),
		paddingY: z.number().int().min(0).max(24).multipleOf(2),
		groupGap: z.number().int().min(0).max(24).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type BubbleValues = z.infer<typeof valuesSchema>;
export type BubbleOverrides = Partial<BubbleValues>;
export type BubbleContext = null;

export function parseBubbleSource(files: { target: string; content: string }[]): {
	values: BubbleValues;
	context: BubbleContext;
} {
	const classes = (filename: string) => {
		const source = files.find((file) => file.target.split("/").at(-1) === filename)?.content ?? "";
		const args =
			/class:\s*cn\(((?:"[^"]*"|[^)"])*)\)/.exec(source)?.[1] ??
			/class=\{cn\(((?:"[^"]*"|[^)"])*)\)/.exec(source)?.[1];
		if (args === undefined) throw new Error(`Bubble registry 缺少 ${filename} 样式`);
		return cn(...[...args.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	};
	const content = classes("bubble-content.svelte");
	const group = classes("bubble-group.svelte");
	const pixels = (utility: string, words: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, words);
		if (value === undefined) throw new Error(`Bubble registry 缺少 ${utility}`);
		return Number(value) * 4;
	};
	return {
		values: valuesSchema.parse({
			paddingX: pixels("px", content),
			paddingY: pixels("py", content),
			groupGap: pixels("gap", group),
			radius: sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, content) ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function bubbleOverrideClasses(overrides: BubbleOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	if (safe.paddingX !== undefined) content.push(`px-${spacing(safe.paddingX)}`);
	if (safe.paddingY !== undefined) content.push(`py-${spacing(safe.paddingY)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		content.push(`rounded-${safe.radius}`);
	return {
		...(content.length ? { "cn-bubble-content": content.join(" ") } : {}),
		...(safe.groupGap !== undefined ? { "cn-bubble-group": `gap-${spacing(safe.groupGap)}` } : {}),
	};
}

function bubbleCss(select: (slot: string) => string, overrides: BubbleOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	if (safe.paddingX !== undefined) content.push(`padding-inline: ${safe.paddingX}px;`);
	if (safe.paddingY !== undefined) content.push(`padding-block: ${safe.paddingY}px;`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		content.push(`border-radius: ${radiusCss(safe.radius)};`);
	return [
		content.length
			? `${select("bubble-content")}:not([data-slot="bubble"][data-variant="ghost"] > *) { ${content.join(" ")} }`
			: "",
		safe.groupGap !== undefined ? `${select("bubble-group")} { gap: ${safe.groupGap}px; }` : "",
	]
		.filter(Boolean)
		.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/bubble.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const BUBBLE_SPEC: TunerSpec<BubbleValues, BubbleContext> = {
	component: "bubble",
	title: "Bubble",
	storageKey: "valar.bubble-styles.v2",
	group: "气泡密度",
	description: "调整普通气泡留白、圆角与连续气泡间距；ghost 保持零留白、无圆角与不限宽",
	parameters: [
		{ kind: "number", key: "paddingX", label: "普通气泡横向留白（px）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "paddingY", label: "普通气泡纵向留白（px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "groupGap", label: "连续气泡间距（px）", min: 0, max: 24, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "普通气泡圆角",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--primary", "主要消息色"],
		["--muted", "低强调表面"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/bubble.json`];
		if (!load) throw new Error(`没有 ${style} 的 Bubble registry`);
		return parseBubbleSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		bubbleCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => bubbleCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: bubbleOverrideClasses,
};
