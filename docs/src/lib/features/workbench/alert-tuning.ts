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
		rowGap: z.number().int().min(0).max(16).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type AlertValues = z.infer<typeof valuesSchema>;
export type AlertOverrides = Partial<AlertValues>;

export function parseAlertSource(files: { target: string; content: string }[]): {
	values: AlertValues;
	context: null;
} {
	const file = files.find((file) => file.target.split("/").at(-1) === "alert.svelte")?.content;
	const classes = /alertVariants\s*=\s*tv\(\{\s*base:\s*"([^"]*)"/.exec(file ?? "")?.[1];
	if (classes === undefined) throw new Error("Alert registry 缺少基础样式");
	const pixels = (utility: string, fallback?: string) => {
		const read = (name: string) => sourceWord(`${name}-(\\d+(?:\\.\\d+)?)`, classes);
		const value = read(utility) ?? (fallback ? read(fallback) : undefined);
		if (value === undefined) throw new Error(`Alert registry 缺少 ${utility} 留白或间距`);
		return Number(value) * 4;
	};
	const radius = sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, classes);
	return {
		values: valuesSchema.parse({
			paddingX: pixels("px"),
			paddingY: pixels("py"),
			rowGap: pixels("gap-y", "gap"),
			radius: radius ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function alertOverrideClasses(overrides: AlertOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	if (safe.paddingX !== undefined) classes.push(`px-${spacing(safe.paddingX)}`);
	if (safe.paddingY !== undefined) classes.push(`py-${spacing(safe.paddingY)}`);
	// Only rows: the style's more-specific icon column gap stays intact.
	if (safe.rowGap !== undefined) classes.push(`gap-y-${spacing(safe.rowGap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		classes.push(`rounded-${safe.radius}`);
	return classes.length ? { "cn-alert": classes.join(" ") } : {};
}

function alertCss(select: string, overrides: AlertOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.paddingX !== undefined)
		rules.push(`${select} { padding-inline: ${safe.paddingX}px; }`);
	if (safe.paddingY !== undefined)
		rules.push(
			`${select} { padding-top: ${safe.paddingY}px; padding-bottom: ${safe.paddingY}px; }`
		);
	if (safe.rowGap !== undefined) rules.push(`${select} { row-gap: ${safe.rowGap}px; }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		rules.push(`${select} { border-radius: ${radiusCss(safe.radius)}; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/alert.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const ALERT_SPEC: TunerSpec<AlertValues, null> = {
	component: "alert",
	title: "Alert",
	description: "调整提示区留白与标题说明间距，保留语义配色、图标列和操作区预留",
	storageKey: "valar.alert-styles.v2",
	group: "留白与圆角",
	parameters: [
		{ kind: "number", key: "paddingX", label: "横向留白（px）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "paddingY", label: "纵向留白（px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "rowGap", label: "标题说明间距（px）", min: 0, max: 16, step: 2 },
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
		["--card", "提示背景"],
		["--destructive", "危险提示色"],
		["--muted-foreground", "说明文字"],
		["--border", "边框色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/alert.json`];
		if (!load) throw new Error(`没有 ${style} 的 Alert registry`);
		return parseAlertSource((await load()).files);
	},
	previewCss: (scope, overrides) => alertCss(`${scope} [data-slot="alert"]`, overrides),
	pageCss: (overrides) =>
		alertCss(`[data-slot="alert"]:not([data-appearance="connection"])${NOT_EDITOR}`, overrides),
	overrideClasses: alertOverrideClasses,
};
