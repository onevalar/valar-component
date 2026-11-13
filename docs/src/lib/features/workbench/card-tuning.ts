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
		spacing: z.number().int().min(0).max(48).multipleOf(2),
		smallSpacing: z.number().int().min(0).max(48).multipleOf(2),
		headerGap: z.number().int().min(0).max(24).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type CardValues = z.infer<typeof valuesSchema>;
export type CardOverrides = Partial<CardValues>;

/** Read the style's shared spacing variable, not one part's conditional padding. */
export function parseCardSource(files: { target: string; content: string }[]): {
	values: CardValues;
	context: null;
} {
	const classes = (name: string) => {
		const file = files.find((file) => file.target.endsWith(`${name}.svelte`))?.content ?? "";
		return /cn\(\s*"([^"]*)"/.exec(file)?.[1] ?? "";
	};
	const root = classes("card");
	const header = classes("card-header");
	const readSpacing = (prefix: string) => {
		const match = new RegExp(`${prefix}\\[--card-spacing:--spacing\\(([\\d.]+)\\)\\]`).exec(root);
		return Number(match?.[1] ?? 0) * 4;
	};
	return {
		values: {
			spacing: readSpacing("(?<![\\w:-])"),
			smallSpacing: readSpacing("data-\\[size=sm\\]:"),
			headerGap:
				Number(
					sourceWord(String.raw`gap-y-(\d+(?:\.5)?)`, header) ??
						sourceWord(String.raw`gap-(\d+(?:\.5)?)`, header) ??
						0
				) * 4,
			radius: (sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, root) ??
				STYLE_VALUE) as CardValues["radius"],
		},
		context: null,
	};
}

export function cardOverrideClasses(overrides: CardOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	const header: string[] = [];
	const footer: string[] = [];
	if (safe.spacing !== undefined) root.push(`[--card-spacing:--spacing(${spacing(safe.spacing)})]`);
	if (safe.smallSpacing !== undefined)
		root.push(`data-[size=sm]:[--card-spacing:--spacing(${spacing(safe.smallSpacing)})]`);
	if (safe.headerGap !== undefined) header.push(`gap-y-${spacing(safe.headerGap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		root.push(
			`rounded-${safe.radius}`,
			`*:[img:first-child]:rounded-t-${safe.radius}`,
			`*:[img:last-child]:rounded-b-${safe.radius}`
		);
		header.push(`rounded-t-${safe.radius}`);
		footer.push(`rounded-b-${safe.radius}`);
	}
	return Object.fromEntries(
		(
			[
				["cn-card", root],
				["cn-card-header", header],
				["cn-card-footer", footer],
			] as const
		)
			.filter(([, classes]) => classes.length)
			.map(([name, classes]) => [name, classes.join(" ")])
	);
}

function cardCss(select: (slot: string) => string, overrides: CardOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const root = select("card");
	const rules: string[] = [];
	if (safe.spacing !== undefined)
		rules.push(`${root}:not([data-size="sm"]) { --card-spacing: ${safe.spacing}px; }`);
	if (safe.smallSpacing !== undefined)
		rules.push(`${root}[data-size="sm"] { --card-spacing: ${safe.smallSpacing}px; }`);
	if (safe.headerGap !== undefined)
		rules.push(`${select("card-header")} { row-gap: ${safe.headerGap}px; }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		const radius = radiusCss(safe.radius);
		rules.push(
			`${root} { border-radius: ${radius}; }`,
			`${select("card-header")}, ${root} > img:first-child { border-top-left-radius: ${radius}; border-top-right-radius: ${radius}; }`,
			`${select("card-footer")}, ${root} > img:last-child { border-bottom-left-radius: ${radius}; border-bottom-right-radius: ${radius}; }`
		);
	}
	return rules.join("\n");
}

const registryCards = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/card.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const CARD_SPEC: TunerSpec<CardValues, null> = {
	component: "card",
	title: "Card",
	description: "留白联动分区间距与内缩，保留各样式的页脚、边框与贴边内容",
	storageKey: "valar.card-styles.v2",
	group: "留白与圆角",
	parameters: [
		{ kind: "number", key: "spacing", label: "默认尺寸留白（px）", min: 0, max: 48, step: 2 },
		{ kind: "number", key: "smallSpacing", label: "小尺寸留白（px）", min: 0, max: 48, step: 2 },
		{ kind: "number", key: "headerGap", label: "标题区间距（px）", min: 0, max: 24, step: 2 },
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
		["--card", "卡片背景"],
		["--card-foreground", "卡片文字"],
		["--muted", "弱化背景"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryCards[`/src/__registry__/json/styles/${style.replace("style-", "")}/card.json`];
		if (!load) throw new Error(`没有 ${style} 的 Card registry`);
		return parseCardSource((await load()).files);
	},
	previewCss: (scope, overrides) => cardCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => cardCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: (overrides) => cardOverrideClasses(overrides),
};
