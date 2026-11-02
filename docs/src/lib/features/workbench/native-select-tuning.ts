import { z } from "zod";
import {
	CONTROL_RADII,
	CONTROL_TOKENS,
	HEIGHT_OPTIONS,
	HEIGHT_TIERS,
	RADIUS_OPTIONS,
	heightTier,
	radiusLevel,
	readButtonHeights,
	tierHeight,
	type ControlContext,
} from "./control-tiers.js";
import { radiusCss, spacing, STYLE_VALUE, type TunerSpec } from "./tuner.js";

export const NATIVE_SELECT_SIZES = [
	{ id: "default", label: "默认" },
	{ id: "sm", label: "小" },
] as const;

const valuesSchema = z
	.object({
		"default.height": z.enum(HEIGHT_TIERS),
		"sm.height": z.enum(HEIGHT_TIERS),
		radius: z.enum(CONTROL_RADII),
		paddingStart: z.number().int().min(0).max(48).multipleOf(2),
	})
	.strict();
export type NativeSelectValues = z.infer<typeof valuesSchema>;
export type NativeSelectOverrides = Partial<NativeSelectValues>;
export type NativeSelectContext = ControlContext;

/** Read the installed select only; the icon and OS option surface have no tuning parameters. */
export function parseNativeSelectSource(
	files: { target: string; content: string }[],
	context: NativeSelectContext
): { values: NativeSelectValues; context: NativeSelectContext } {
	const file =
		files.find((file) => file.target.split("/").at(-1) === "native-select.svelte")?.content ?? "";
	const classes = /<select\b[\s\S]*?\bclass="([^"]*)"/.exec(file)?.[1];
	if (classes === undefined) throw new Error("Native Select registry 缺少闭合控件样式");
	const words = classes.split(/\s+/);
	const read = (prefix: string, utility: string) => {
		const start = `${prefix}${utility}-`;
		return words.find((word) => word.startsWith(start))?.slice(start.length);
	};
	const pixels = (value: string | undefined) => {
		if (value === undefined || !/^\d+(?:\.(?:25|5|75))?$/.test(value))
			throw new Error("Native Select registry 缺少可读取的高度或文字侧内边距");
		return Number(value) * 4;
	};
	const baseRadius = read("", "rounded");
	const radii = NATIVE_SELECT_SIZES.map(
		({ id }) => read(`data-[size=${id}]:`, "rounded") ?? baseRadius
	);
	// Nova's capped small radius is not the default radius. Never flatten it on baseline read.
	const radius = radii.every((value) => value === radii[0])
		? (CONTROL_RADII.find((value) => value === radii[0]) ?? STYLE_VALUE)
		: STYLE_VALUE;
	return {
		values: valuesSchema.parse({
			...Object.fromEntries(
				NATIVE_SELECT_SIZES.map(({ id }) => [
					`${id}.height`,
					heightTier(
						pixels(read(`data-[size=${id}]:`, "h") ?? read("", "h")),
						context.buttonHeights,
						id
					),
				])
			),
			radius,
			paddingStart: pixels(read("", "pl")),
		}),
		context,
	};
}

export function nativeSelectOverrideClasses(
	overrides: NativeSelectOverrides,
	context: NativeSelectContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	for (const { id } of NATIVE_SELECT_SIZES) {
		const height = tierHeight(safe[`${id}.height`], context);
		if (height !== undefined) classes.push(`data-[size=${id}]:h-${spacing(height)}`);
	}
	const radius = radiusLevel(safe.radius);
	// Replace the more specific small-size utility as well (including Nova's capped radius).
	if (radius !== undefined) classes.push(`rounded-${radius}`, `data-[size=sm]:rounded-${radius}`);
	if (safe.paddingStart !== undefined) classes.push(`pl-${spacing(safe.paddingStart)}`);
	return classes.length ? { "cn-native-select": classes.join(" ") } : {};
}

function nativeSelectCss(
	select: string,
	overrides: NativeSelectOverrides,
	context: NativeSelectContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	for (const { id } of NATIVE_SELECT_SIZES) {
		const height = tierHeight(safe[`${id}.height`], context);
		if (height !== undefined) rules.push(`${select}[data-size="${id}"] { height: ${height}px; }`);
	}
	const radius = radiusLevel(safe.radius);
	if (radius !== undefined) rules.push(`${select} { border-radius: ${radiusCss(radius)}; }`);
	if (safe.paddingStart !== undefined)
		rules.push(`${select} { padding-left: ${safe.paddingStart}px; }`);
	return rules.join("\n");
}

const registryNativeSelects = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/native-select.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const NATIVE_SELECT_SPEC: TunerSpec<NativeSelectValues, NativeSelectContext> = {
	component: "native-select",
	title: "Native Select",
	description: "闭合控件沿用 Button 高度与圆角档位；保留箭头和系统原生选项面板",
	storageKey: "valar.native-select-styles.v2",
	group: "闭合控件尺寸与圆角",
	parameters: [
		...NATIVE_SELECT_SIZES.map(({ id, label }) => ({
			kind: "select" as const,
			key: `${id}.height`,
			label: `${label}尺寸高度`,
			options: HEIGHT_OPTIONS,
		})),
		{ kind: "select", key: "radius", label: "圆角档位", options: RADIUS_OPTIONS },
		{
			kind: "number",
			key: "paddingStart",
			label: "文字侧内边距（px）",
			min: 0,
			max: 48,
			step: 2,
		},
	],
	valuesSchema,
	tokens: CONTROL_TOKENS,
	async readBaseline(probe, style) {
		const context = { buttonHeights: readButtonHeights(probe) };
		const load =
			registryNativeSelects[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/native-select.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Native Select registry`);
		return parseNativeSelectSource((await load()).files, context);
	},
	previewCss: (scope, overrides, context) =>
		nativeSelectCss(`${scope} [data-slot="native-select"]`, overrides, context),
	pageCss: (overrides, context) =>
		nativeSelectCss(`[data-slot="native-select"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: nativeSelectOverrideClasses,
};
