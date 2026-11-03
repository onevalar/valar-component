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
		height: z.number().int().min(16).max(32).multipleOf(2),
		paddingX: z.number().int().min(0).max(12).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
		groupGap: z.number().int().min(0).max(16).multipleOf(2),
	})
	.strict();
export type KbdValues = z.infer<typeof valuesSchema>;
export type KbdOverrides = Partial<KbdValues>;
export type KbdContext = null;

export function parseKbdSource(files: { target: string; content: string }[]): {
	values: KbdValues;
	context: KbdContext;
} {
	const classes = (name: string, slot: string) => {
		const source = files.find((file) => file.target.split("/").at(-1) === name)?.content ?? "";
		const root = new RegExp(`data-slot="${slot}"[\\s\\S]*?class=\\{cn\\(([\\s\\S]*?)\\)\\}`).exec(
			source
		)?.[1];
		if (root === undefined) throw new Error(`Kbd registry 缺少 ${slot} 样式`);
		return cn(...[...root.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	};
	const root = classes("kbd.svelte", "kbd");
	const group = classes("kbd-group.svelte", "kbd-group");
	const pixels = (utility: string, words: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, words);
		if (value === undefined) throw new Error(`Kbd registry 缺少 ${utility}`);
		return Number(value) * 4;
	};
	return {
		values: valuesSchema.parse({
			height: pixels("h", root),
			paddingX: pixels("px", root),
			radius: sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, root) ?? STYLE_VALUE,
			groupGap: pixels("gap", group),
		}),
		context: null,
	};
}

export function kbdOverrideClasses(overrides: KbdOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	if (safe.height !== undefined) root.push(`h-${spacing(safe.height)}`);
	if (safe.paddingX !== undefined) root.push(`px-${spacing(safe.paddingX)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) root.push(`rounded-${safe.radius}`);
	return {
		...(root.length ? { "cn-kbd": root.join(" ") } : {}),
		...(safe.groupGap !== undefined ? { "cn-kbd-group": `gap-${spacing(safe.groupGap)}` } : {}),
	};
}

function kbdCss(select: (slot: string) => string, overrides: KbdOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.height !== undefined) rules.push(`${select("kbd")} { height: ${safe.height}px; }`);
	if (safe.paddingX !== undefined)
		rules.push(`${select("kbd")} { padding-inline: ${safe.paddingX}px; }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		rules.push(`${select("kbd")} { border-radius: ${radiusCss(safe.radius)}; }`);
	if (safe.groupGap !== undefined)
		rules.push(`${select("kbd-group")} { gap: ${safe.groupGap}px; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/kbd.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const KBD_SPEC: TunerSpec<KbdValues, KbdContext> = {
	component: "kbd",
	title: "Kbd",
	description: "只调整按键高度、横向留白、圆角与组合间距；保留 kbd 语义、字体和 SVG 大小",
	storageKey: "valar.kbd-styles.v2",
	group: "按键几何",
	parameters: [
		{ kind: "number", key: "height", label: "按键高度（px）", min: 16, max: 32, step: 2 },
		{ kind: "number", key: "paddingX", label: "横向留白（px）", min: 0, max: 12, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
		{ kind: "number", key: "groupGap", label: "组合键间距（px）", min: 0, max: 16, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--text-xs", "按键字号"],
		["--muted", "按键背景"],
		["--muted-foreground", "按键文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/kbd.json`];
		if (!load) throw new Error(`没有 ${style} 的 Kbd registry`);
		return parseKbdSource((await load()).files);
	},
	previewCss: (scope, overrides) => kbdCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => kbdCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: kbdOverrideClasses,
};
