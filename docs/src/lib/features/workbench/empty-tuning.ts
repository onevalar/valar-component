import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		padding: z.number().int().min(8).max(64).multipleOf(2),
		gap: z.number().int().min(0).max(32).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type EmptyValues = z.infer<typeof valuesSchema>;
export type EmptyOverrides = Partial<EmptyValues>;

/** Only the flattened root geometry; header, media and content keep their own spacing. */
export function parseEmptySource(files: { target: string; content: string }[]): {
	values: EmptyValues;
	context: null;
} {
	const file = files.find((file) => file.target.split("/").at(-1) === "empty.svelte")?.content;
	const classes = /cn\(\s*"([^"]*)"/.exec(file ?? "")?.[1];
	if (classes === undefined) throw new Error("Empty registry 缺少根元素样式");
	const words = classes.split(/\s+/);
	const pixels = (utility: string) => {
		const value = words.find((word) => word.startsWith(`${utility}-`))?.slice(utility.length + 1);
		if (value === undefined) throw new Error(`Empty registry 缺少 ${utility} 基础样式`);
		if (!/^\d+(?:\.(?:25|5|75))?$/.test(value))
			throw new Error(`Empty registry 的 ${utility} 无法读取为间距`);
		return Number(value) * 4;
	};
	const radius = words.find((word) => word.startsWith("rounded-"))?.slice("rounded-".length);
	return {
		values: valuesSchema.parse({
			padding: pixels("p"),
			gap: pixels("gap"),
			// Sera deliberately has no radius utility; absent and non-tier radii stay style-owned.
			radius: RADIUS_CHOICES.find((value) => value === radius) ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function emptyOverrideClasses(overrides: EmptyOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	if (safe.padding !== undefined) classes.push(`p-${spacing(safe.padding)}`);
	if (safe.gap !== undefined) classes.push(`gap-${spacing(safe.gap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		classes.push(`rounded-${safe.radius}`);
	return classes.length ? { "cn-empty": classes.join(" ") } : {};
}

function emptyCss(select: string, overrides: EmptyOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.padding !== undefined) rules.push(`${select} { padding: ${safe.padding}px; }`);
	if (safe.gap !== undefined) rules.push(`${select} { gap: ${safe.gap}px; }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		rules.push(`${select} { border-radius: ${radiusCss(safe.radius)}; }`);
	return rules.join("\n");
}

const registryEmpties = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/empty.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const EMPTY_SPEC: TunerSpec<EmptyValues, null> = {
	component: "empty",
	title: "Empty",
	description: "只调整外层留白、主区间距与圆角，保留内部层次、内容最大宽度和内嵌控件样式",
	storageKey: "valar.empty-styles.v2",
	group: "外层留白与圆角",
	parameters: [
		{ kind: "number", key: "padding", label: "外层留白（px）", min: 8, max: 64, step: 2 },
		{ kind: "number", key: "gap", label: "主区间距（px）", min: 0, max: 32, step: 2 },
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
		["--text-sm", "小号字"],
		["--text-lg", "大号字"],
		["--foreground", "文字色"],
		["--muted-foreground", "说明文字"],
		["--muted", "媒体背景"],
		["--border", "边框色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryEmpties[`/src/__registry__/json/styles/${style.replace("style-", "")}/empty.json`];
		if (!load) throw new Error(`没有 ${style} 的 Empty registry`);
		return parseEmptySource((await load()).files);
	},
	previewCss: (scope, overrides) => emptyCss(`${scope} [data-slot="empty"]`, overrides),
	pageCss: (overrides) => emptyCss(`[data-slot="empty"]${NOT_EDITOR}`, overrides),
	overrideClasses: emptyOverrideClasses,
};
