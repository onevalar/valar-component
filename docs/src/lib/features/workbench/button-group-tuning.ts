import { cn } from "cn";
import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	radiusCss,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		textPaddingX: z.number().int().min(0).max(24).multipleOf(2),
		textGap: z.number().int().min(0).max(16).multipleOf(2),
		joinedRadius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type ButtonGroupValues = z.infer<typeof valuesSchema>;
export type ButtonGroupOverrides = Partial<ButtonGroupValues>;
export type ButtonGroupContext = null;

const FIRST = "[&>[data-slot]:first-child]";
// A native Select may append a hidden select after its visible trigger.
const LAST = "[&>[data-slot]:not(:has(~[data-slot]))]";
const LAST_NOT_FIRST = "[&>[data-slot]:not(:has(~[data-slot])):not(:first-child)]";

function source(files: { target: string; content: string }[], name: string): string {
	const content = files.find((file) => file.target.split("/").at(-1) === `${name}.svelte`)?.content;
	if (content === undefined) throw new Error(`Button Group registry 缺少 ${name}`);
	return content;
}

/** Merge all leading literal arguments, exactly as the component's real cn call does. */
function textClasses(content: string): string {
	const args = /cn\(\s*((?:"(?:\\.|[^"\\])*"\s*,\s*)+)/.exec(content)?.[1];
	if (args === undefined) throw new Error("Button Group registry 缺少 Text 样式");
	return cn(...[...args.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([literal]) => JSON.parse(literal)));
}

function variantClasses(content: string, orientation: string): string {
	const literal = new RegExp(`${orientation}:\\s*("(?:\\\\.|[^"\\\\])*")`).exec(content)?.[1];
	if (literal === undefined) throw new Error(`Button Group registry 缺少 ${orientation} 样式`);
	return cn(JSON.parse(literal));
}

export function parseButtonGroupSource(files: { target: string; content: string }[]): {
	values: ButtonGroupValues;
	context: ButtonGroupContext;
} {
	const text = textClasses(source(files, "button-group-text")).split(/\s+/);
	const root = source(files, "button-group");
	const readPixels = (utility: string) => {
		const word = text.find((word) => new RegExp(`^${utility}-\\d+(?:\\.5)?$`).test(word));
		if (!word) throw new Error(`Button Group Text 缺少 ${utility} 样式`);
		return Number(word.slice(utility.length + 1)) * 4;
	};
	const textRadius = text.find((word) => /^rounded-[\w]+$/.test(word))?.slice(8);
	const radii = [textRadius];
	for (const [orientation, start, end] of [
		["horizontal", "l", "r"],
		["vertical", "t", "b"],
	] as const) {
		const words = variantClasses(root, orientation).split(/\s+/);
		for (const [selector, side] of [
			[FIRST, start],
			[LAST, end],
		]) {
			const prefix = `${selector}:rounded-${side}-`;
			radii.push(
				words
					.find((word) => word.startsWith(prefix))
					?.slice(prefix.length)
					.replace(/!$/, "")
			);
		}
	}
	// Unmodified first endpoints inherit Button/Input/Select geometry, not a group-owned radius.
	const joinedRadius =
		RADIUS_CHOICES.find((radius) => radii.every((value) => value === radius)) ?? STYLE_VALUE;
	return {
		values: valuesSchema.parse({
			textPaddingX: readPixels("px"),
			textGap: readPixels("gap"),
			joinedRadius,
		}),
		context: null,
	};
}

export function buttonGroupOverrideClasses(
	overrides: ButtonGroupOverrides
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const result: Record<string, string> = {};
	const text: string[] = [];
	if (safe.textPaddingX !== undefined) text.push(`px-${spacing(safe.textPaddingX)}`);
	if (safe.textGap !== undefined) text.push(`gap-${spacing(safe.textGap)}`);
	if (safe.joinedRadius !== undefined && safe.joinedRadius !== STYLE_VALUE) {
		const radius = safe.joinedRadius;
		text.push(`rounded-${radius}`);
		for (const [orientation, start, end] of [
			["horizontal", "l", "r"],
			["vertical", "t", "b"],
		]) {
			result[`cn-button-group-orientation-${orientation}`] = [
				`${FIRST}:rounded-${start}-${radius}!`,
				// Replace Sera's all-corner important reset as well as other styles' side radius.
				`${LAST}:rounded-${radius}!`,
				`${LAST}:rounded-${end}-${radius}!`,
				`${LAST_NOT_FIRST}:rounded-${start}-none!`,
			].join(" ");
		}
	}
	if (text.length) result["cn-button-group-text"] = text.join(" ");
	return result;
}

function buttonGroupCss(select: (slot: string) => string, overrides: ButtonGroupOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const text = select("button-group-text");
	if (safe.textPaddingX !== undefined)
		rules.push(`${text} { padding-inline: ${safe.textPaddingX}px; }`);
	if (safe.textGap !== undefined) rules.push(`${text} { gap: ${safe.textGap}px; }`);
	if (safe.joinedRadius !== undefined && safe.joinedRadius !== STYLE_VALUE) {
		const radius = radiusCss(safe.joinedRadius);
		rules.push(`${text} { border-radius: ${radius}; }`);
		for (const [orientation, start, end] of [
			["horizontal", "left", "right"],
			["vertical", "top", "bottom"],
		] as const) {
			const root = `${select("button-group")}[data-orientation="${orientation}"]`;
			const last = `${root} > [data-slot]:not(:has(~[data-slot]))`;
			const corners = (side: string, value: string) => {
				const names =
					side === "left" || side === "right"
						? [`top-${side}`, `bottom-${side}`]
						: [`${side}-left`, `${side}-right`];
				return names.map((corner) => `border-${corner}-radius: ${value} !important;`).join(" ");
			};
			rules.push(
				// A scoped Text radius must not outrank the group's original inner-corner resets.
				`${root} > [data-slot]:not(:first-child) { ${corners(start, "0")} }`,
				`${root} > [data-slot]:has(~[data-slot]) { ${corners(end, "0")} }`,
				`${root} > [data-slot]:first-child { ${corners(start, radius)} }`,
				`${last} { border-radius: ${radius} !important; }`,
				`${last}:not(:first-child) { ${corners(start, "0")} }`,
				`${last} { ${corners(end, radius)} }`
			);
		}
	}
	return rules.join("\n");
}

const registryGroups = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/button-group.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const BUTTON_GROUP_SPEC: TunerSpec<ButtonGroupValues, ButtonGroupContext> = {
	component: "button-group",
	title: "Button Group",
	description: "只调 Text 留白、内部间距和共同端点圆角；保留拼接边框与子控件尺寸，不增加组内间距",
	storageKey: "valar.button-group-styles.v2",
	group: "文字与拼接端点",
	parameters: [
		{ kind: "number", key: "textPaddingX", label: "Text 水平留白（px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "textGap", label: "Text 内部间距（px）", min: 0, max: 16, step: 2 },
		{
			kind: "select",
			key: "joinedRadius",
			label: "共同端点圆角",
			options: RADIUS_CHOICES.map((value) => ({
				value,
				label: value === STYLE_VALUE ? "样式自带（保留子控件差异）" : RADIUS_LABELS[value],
			})),
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--border", "边框色"],
		["--input", "控件边框"],
		["--muted", "文字块背景"],
		["--foreground", "文字色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryGroups[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/button-group.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Button Group registry`);
		return parseButtonGroupSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		buttonGroupCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => buttonGroupCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: buttonGroupOverrideClasses,
};
