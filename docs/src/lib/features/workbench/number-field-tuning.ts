import { cn } from "cn";
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
import { radiusCss, sourceWord, spacing, STYLE_VALUE, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		height: z.enum(HEIGHT_TIERS),
		radius: z.enum(CONTROL_RADII),
		paddingX: z.number().int().min(0).max(16).multipleOf(2),
	})
	.strict();
export type NumberFieldValues = z.infer<typeof valuesSchema>;
export type NumberFieldOverrides = Partial<NumberFieldValues>;
export type NumberFieldContext = ControlContext & { borderY: number };

/** cn resolves literal defaults followed by the installed override, as the component does. */
export function parseNumberFieldSource(
	files: { target: string; content: string }[],
	context: NumberFieldContext
): { values: NumberFieldValues; context: NumberFieldContext } {
	const source =
		files.find((f) => f.target.split("/").at(-1) === "number-field.svelte")?.content ?? "";
	const classes = (slot: string) => {
		const value = new RegExp(`data-slot="${slot}"[\\s\\S]*?class=\\{cn\\(([\\s\\S]*?)\\)`).exec(
			source
		)?.[1];
		if (value === undefined) throw new Error(`Number Field registry 缺少 ${slot} 样式`);
		return cn(...[...value.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	};
	const root = classes("number-field");
	const input = classes("number-field-input");
	const decrement = classes("number-field-decrement");
	const increment = classes("number-field-increment");
	const pixels = (utility: string, words: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.(?:25|5|75))?)`, words);
		return value === undefined ? undefined : Number(value) * 4;
	};
	const minHeight = pixels("min-h", root);
	const explicitHeight = pixels("h", root);
	let height: number;
	if (minHeight === undefined) throw new Error("Number Field registry 缺少外框高度下限");
	if (explicitHeight !== undefined) {
		if (
			![decrement, increment].every(
				(words) =>
					words.split(" ").includes("size-full") &&
					words.split(" ").includes("w-auto") &&
					words.split(" ").includes("aspect-square")
			) ||
			!input.split(" ").includes("h-full")
		)
			throw new Error("Number Field registry 的外框与内部高度不一致");
		height = Math.max(minHeight, explicitHeight);
	} else {
		const inputHeight = pixels("h", input);
		const buttonHeights = [decrement, increment].map((words) => pixels("size", words));
		if (inputHeight === undefined || buttonHeights.some((value) => value !== inputHeight))
			throw new Error("Number Field registry 缺少一致的内部高度");
		// The original 40px children sit INSIDE the border: the untouched outer box is 42px.
		height = Math.max(minHeight, inputHeight + context.borderY);
	}
	const radii = [
		sourceWord("rounded-([^ ]+)", root),
		sourceWord("rounded-s-([^ ]+)", decrement),
		sourceWord("rounded-e-([^ ]+)", increment),
	];
	if (radii.some((value) => value === undefined)) throw new Error("Number Field registry 缺少圆角");
	const radius = radii.every((value) => value === radii[0])
		? (CONTROL_RADII.find((value) => value === radii[0]) ?? STYLE_VALUE)
		: STYLE_VALUE;
	const paddingX = pixels("px", input);
	if (paddingX === undefined) throw new Error("Number Field registry 缺少数字区留白");
	return {
		values: valuesSchema.parse({
			height: heightTier(height, context.buttonHeights, "default"),
			radius,
			paddingX,
		}),
		context,
	};
}

export function numberFieldOverrideClasses(
	overrides: NumberFieldOverrides,
	context: NumberFieldContext | undefined
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [],
		input: string[] = [],
		decrement: string[] = [],
		increment: string[] = [];
	const height = tierHeight(safe.height, context);
	if (height !== undefined) {
		root.push(`h-${spacing(height)}`, `min-h-${spacing(height)}`);
		input.push("h-full");
		decrement.push("size-full", "w-auto", "aspect-square");
		increment.push("size-full", "w-auto", "aspect-square");
	}
	const radius = radiusLevel(safe.radius);
	if (radius !== undefined) {
		root.push(`rounded-${radius}`);
		decrement.push(`rounded-s-${radius}`);
		increment.push(`rounded-e-${radius}`);
	}
	if (safe.paddingX !== undefined) input.push(`px-${spacing(safe.paddingX)}`);
	return Object.fromEntries(
		[
			["cn-number-field", root],
			["cn-number-field-input", input],
			["cn-number-field-decrement", decrement],
			["cn-number-field-increment", increment],
		]
			.filter(([, words]) => words.length)
			.map(([slot, words]) => [slot, (words as string[]).join(" ")])
	);
}

function numberFieldCss(
	select: (slot: string) => string,
	overrides: NumberFieldOverrides,
	context: NumberFieldContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const height = tierHeight(safe.height, context);
	if (height !== undefined) {
		rules.push(`${select("number-field")} { height: ${height}px; min-height: ${height}px; }`);
		rules.push(`${select("number-field-input")} { height: 100%; }`);
		for (const slot of ["number-field-decrement", "number-field-increment"])
			rules.push(`${select(slot)} { width: auto; height: 100%; aspect-ratio: 1; }`);
	}
	const radius = radiusLevel(safe.radius);
	if (radius !== undefined) {
		rules.push(`${select("number-field")} { border-radius: ${radiusCss(radius)}; }`);
		rules.push(
			`${select("number-field-decrement")} { border-start-start-radius: ${radiusCss(radius)}; border-end-start-radius: ${radiusCss(radius)}; }`
		);
		rules.push(
			`${select("number-field-increment")} { border-start-end-radius: ${radiusCss(radius)}; border-end-end-radius: ${radiusCss(radius)}; }`
		);
	}
	if (safe.paddingX !== undefined)
		rules.push(`${select("number-field-input")} { padding-inline: ${safe.paddingX}px; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/number-field.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const NUMBER_FIELD_SPEC: TunerSpec<NumberFieldValues, NumberFieldContext> = {
	component: "number-field",
	title: "Number Field",
	description: "外框高度沿用 Button 档位并联动加减按钮；保留数值、格式化与表单行为",
	storageKey: "valar.number-field-styles.v2",
	group: "尺寸与圆角",
	parameters: [
		{ kind: "select", key: "height", label: "外框高度档位", options: HEIGHT_OPTIONS },
		{ kind: "select", key: "radius", label: "圆角档位", options: RADIUS_OPTIONS },
		{ kind: "number", key: "paddingX", label: "数字区横向留白（px）", min: 0, max: 16, step: 2 },
	],
	valuesSchema,
	tokens: CONTROL_TOKENS,
	async readBaseline(probe, style) {
		const computed = getComputedStyle(probe.querySelector('[data-slot="number-field"]')!);
		const context = {
			buttonHeights: readButtonHeights(probe),
			borderY: parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth),
		};
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/number-field.json`];
		if (!load) throw new Error(`没有 ${style} 的 Number Field registry`);
		return parseNumberFieldSource((await load()).files, context);
	},
	previewCss: (scope, overrides, context) =>
		numberFieldCss((slot) => `${scope} [data-slot="${slot}"]`, overrides, context),
	pageCss: (overrides, context) =>
		numberFieldCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: numberFieldOverrideClasses,
};
