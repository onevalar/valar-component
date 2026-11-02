import { z } from "zod";
import {
	CONTROL_RADII,
	CONTROL_TOKENS,
	HEIGHT_OPTIONS,
	HEIGHT_TIERS,
	RADIUS_OPTIONS,
	heightTier,
	readButtonHeights,
	tierHeight,
	type ControlContext,
} from "./control-tiers.js";
import { RADIUS_LEVELS, radiusCss, sourceWord, spacing, type TunerSpec } from "./tuner.js";

const padding = z.number().int().min(0).max(48).multipleOf(2);
const valuesSchema = z
	.object({
		height: z.enum(HEIGHT_TIERS),
		radius: z.enum(CONTROL_RADII),
		inlinePadding: padding,
		blockPaddingX: padding,
		addonGap: z.number().int().min(0).max(24).multipleOf(2),
	})
	.strict();
export type InputGroupValues = z.infer<typeof valuesSchema>;
export type InputGroupOverrides = Partial<InputGroupValues>;

/** Only the enclosing group's geometry; Input, Textarea and Button keep their own parameters. */
export function parseInputGroupSource(
	files: { target: string; content: string }[],
	context: ControlContext
): { values: InputGroupValues; context: ControlContext } {
	const file = (name: string) => {
		const content = files.find((file) => file.target.split("/").at(-1) === name)?.content;
		if (!content) throw new Error(`Input Group registry 缺少 ${name}`);
		return content;
	};
	const root = file("input-group.svelte");
	const addon = file("input-group-addon.svelte");
	const align = (name: string) => new RegExp(`"${name}":\\s*"([^"]*)"`).exec(addon)?.[1] ?? "";
	const px = (utility: string, content: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.\\d+)?)`, content);
		return value === undefined ? undefined : Number(value) * 4;
	};
	const height = px("h", root);
	const gap = px("gap", addon);
	if (height === undefined || gap === undefined)
		throw new Error("Input Group registry 缺少高度或附加内容间距");
	const inlinePadding = px("pl", align("inline-start")) ?? 0;
	const blockPaddingX = px("px", align("block-start")) ?? 0;
	if (
		inlinePadding !== (px("pr", align("inline-end")) ?? 0) ||
		blockPaddingX !== (px("px", align("block-end")) ?? 0)
	)
		throw new Error("Input Group registry 的首尾留白不一致");
	const radii = [
		...root.matchAll(
			/(?:^|[\s"])(?:has-data-\[align=block-(?:start|end)\]:|has-\[textarea\]:)?rounded-([^\s"]+)/g
		),
	].map((match) => match[1]);
	const radius =
		radii.length &&
		radii.every((value) => value === radii[0]) &&
		RADIUS_LEVELS.some((value) => value === radii[0])
			? radii[0]
			: "style";
	return {
		values: valuesSchema.parse({
			height: heightTier(height, context.buttonHeights, "default"),
			radius,
			inlinePadding,
			blockPaddingX,
			addonGap: gap,
		}),
		context,
	};
}

// Inline inputs fill the group's content box. Block addons and textarea retain auto height.
const FILL_INLINE_INPUT =
	"not-has-[>[data-align=block-start]]:not-has-[>[data-align=block-end]]:[&>input]:h-full";

export function inputGroupOverrideClasses(
	overrides: InputGroupOverrides,
	context: ControlContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	const classes: Record<string, string> = {};
	const height = tierHeight(safe.height, context);
	if (height !== undefined) root.push(`h-${spacing(height)}`, FILL_INLINE_INPUT);
	if (safe.radius !== undefined && safe.radius !== "style")
		root.push(
			`rounded-${safe.radius}`,
			`has-data-[align=block-start]:rounded-${safe.radius}`,
			`has-data-[align=block-end]:rounded-${safe.radius}`,
			`has-[textarea]:rounded-${safe.radius}`
		);
	if (root.length) classes["cn-input-group"] = root.join(" ");
	if (safe.inlinePadding !== undefined) {
		classes["cn-input-group-addon-align-inline-start"] = `pl-${spacing(safe.inlinePadding)}`;
		classes["cn-input-group-addon-align-inline-end"] = `pr-${spacing(safe.inlinePadding)}`;
	}
	if (safe.blockPaddingX !== undefined)
		for (const side of ["start", "end"])
			classes[`cn-input-group-addon-align-block-${side}`] = `px-${spacing(safe.blockPaddingX)}`;
	if (safe.addonGap !== undefined)
		classes["cn-input-group-addon"] = `gap-${spacing(safe.addonGap)}`;
	return classes;
}

function inputGroupCss(
	select: (slot: string) => string,
	overrides: InputGroupOverrides,
	context: ControlContext
) {
	const safe = valuesSchema.partial().parse(overrides);
	const root = select("input-group");
	const addon = select("input-group-addon");
	const rules: string[] = [];
	const height = tierHeight(safe.height, context);
	if (height !== undefined) {
		const inline = `${root}:not(:has(>[data-align=block-start])):not(:has(>[data-align=block-end])):not(:has(>textarea))`;
		rules.push(`${inline} { height: ${height}px; }`, `${inline} > input { height: 100%; }`);
	}
	if (safe.radius !== undefined && safe.radius !== "style")
		rules.push(`${root} { border-radius: ${radiusCss(safe.radius)}; }`);
	if (safe.inlinePadding !== undefined)
		rules.push(
			`${addon}[data-align="inline-start"] { padding-left: ${safe.inlinePadding}px; }`,
			`${addon}[data-align="inline-end"] { padding-right: ${safe.inlinePadding}px; }`
		);
	if (safe.blockPaddingX !== undefined)
		rules.push(
			`${addon}:is([data-align="block-start"], [data-align="block-end"]) { padding-left: ${safe.blockPaddingX}px; padding-right: ${safe.blockPaddingX}px; }`
		);
	if (safe.addonGap !== undefined) rules.push(`${addon} { gap: ${safe.addonGap}px; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/input-group.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const INPUT_GROUP_SPEC: TunerSpec<InputGroupValues, ControlContext> = {
	component: "input-group",
	title: "Input Group",
	description: "单行高度对齐 Button；块状附加内容与多行输入保留自动高度，不重复调整内部控件",
	storageKey: "valar.input-group-styles.v2",
	group: "组合尺寸与附加内容",
	parameters: [
		{ kind: "select", key: "height", label: "单行高度档位", options: HEIGHT_OPTIONS },
		{ kind: "select", key: "radius", label: "组合圆角档位", options: RADIUS_OPTIONS },
		{
			kind: "number",
			key: "inlinePadding",
			label: "行内附加内容外侧留白（px）",
			min: 0,
			max: 48,
			step: 2,
		},
		{
			kind: "number",
			key: "blockPaddingX",
			label: "块状附加内容横向留白（px）",
			min: 0,
			max: 48,
			step: 2,
		},
		{ kind: "number", key: "addonGap", label: "附加内容间距（px）", min: 0, max: 24, step: 2 },
	],
	valuesSchema,
	tokens: CONTROL_TOKENS,
	async readBaseline(probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/input-group.json`];
		if (!load) throw new Error(`没有 ${style} 的 Input Group registry`);
		return parseInputGroupSource((await load()).files, { buttonHeights: readButtonHeights(probe) });
	},
	previewCss: (scope, overrides, context) =>
		inputGroupCss((slot) => `${scope} [data-slot="${slot}"]`, overrides, context),
	pageCss: (overrides, context) =>
		inputGroupCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: inputGroupOverrideClasses,
};
