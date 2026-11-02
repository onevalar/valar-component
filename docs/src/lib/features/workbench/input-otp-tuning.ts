import { z } from "zod";
import {
	CONTROL_TOKENS,
	HEIGHT_OPTIONS,
	HEIGHT_TIERS,
	RADIUS_OPTIONS,
	heightTier,
	readButtonHeights,
	tierHeight,
	type ControlContext,
} from "./control-tiers.js";
import {
	RADIUS_CHOICES,
	RADIUS_LEVELS,
	radiusCss,
	sourceWord,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		slotSize: z.enum(HEIGHT_TIERS),
		groupGap: z.number().int().min(0).max(24).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type InputOtpValues = z.infer<typeof valuesSchema>;
export type InputOtpOverrides = Partial<InputOtpValues>;
export type InputOtpContext = ControlContext;

function sourceClasses(files: { target: string; content: string }[], name: string): string {
	const file = files.find((file) => file.target.split("/").at(-1) === `${name}.svelte`);
	const classes = /cn\(\s*"([^"]*)"/.exec(file?.content ?? "")?.[1];
	if (classes === undefined) throw new Error(`Input OTP registry 缺少 ${name} 的样式`);
	return classes;
}

/** Source utilities take priority, including an explicit endpoint over Lyra/Sera's rounded-none. */
export function parseInputOtpSource(
	files: { target: string; content: string }[],
	context: InputOtpContext
): { values: InputOtpValues; context: InputOtpContext } {
	const root = sourceClasses(files, "input-otp");
	const group = sourceClasses(files, "input-otp-group");
	const slot = sourceClasses(files, "input-otp-slot");
	const size = (utility: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.\\d+)?)`, slot);
		return value === undefined ? undefined : Number(value) * 4;
	};
	const height = size("h") ?? size("size");
	const width = size("w") ?? size("size");
	if (height === undefined || width === undefined) throw new Error("Input OTP registry 缺少槽尺寸");
	const readRadius = (classes: string, prefix: string) =>
		sourceWord(`${prefix}rounded-([^ ]+)`, classes);
	const groupRadius = readRadius(group, "");
	const baseRadius = readRadius(slot, "") ?? "none";
	// Directional utilities are emitted after the same-variant shorthand by Tailwind.
	const firstRadius =
		sourceWord("first:rounded-l-([^ ]+)", slot) ?? readRadius(slot, "first:") ?? baseRadius;
	const lastRadius =
		sourceWord("last:rounded-r-([^ ]+)", slot) ?? readRadius(slot, "last:") ?? baseRadius;
	const radius =
		RADIUS_LEVELS.find(
			(level) =>
				groupRadius === level &&
				firstRadius === level &&
				lastRadius === level &&
				baseRadius === "none"
		) ?? STYLE_VALUE;
	const gap = sourceWord(String.raw`gap-(\d+(?:\.\d+)?)`, root);
	if (gap === undefined) throw new Error("Input OTP registry 缺少组间距");
	return {
		values: valuesSchema.parse({
			slotSize:
				height === width ? heightTier(height, context.buttonHeights, "default") : STYLE_VALUE,
			groupGap: Number(gap) * 4,
			radius,
		}),
		context,
	};
}

export function inputOtpOverrideClasses(
	overrides: InputOtpOverrides,
	context: InputOtpContext | undefined
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string> = {};
	const slot: string[] = [];
	const height = tierHeight(safe.slotSize, context);
	if (height !== undefined) slot.push(`size-${spacing(height)}`);
	if (safe.groupGap !== undefined) classes["cn-input-otp"] = `gap-${spacing(safe.groupGap)}`;
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		classes["cn-input-otp-group"] = `rounded-${safe.radius}`;
		slot.push(
			"rounded-none",
			"first:rounded-none",
			"last:rounded-none",
			`first:rounded-l-${safe.radius}`,
			`last:rounded-r-${safe.radius}`,
			// A one-cell group is both endpoints; the later last:rounded-none must not erase its left.
			`first:last:rounded-${safe.radius}`
		);
	}
	if (slot.length) classes["cn-input-otp-slot"] = slot.join(" ");
	return classes;
}

function inputOtpCss(
	select: (selector: string) => string,
	overrides: InputOtpOverrides,
	context: InputOtpContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const slot = select('[data-slot="input-otp-slot"]');
	const height = tierHeight(safe.slotSize, context);
	if (height !== undefined) rules.push(`${slot} { height: ${height}px; width: ${height}px; }`);
	// Bits puts data-slot="input-otp" on the real input, not its flex container.
	if (safe.groupGap !== undefined)
		rules.push(`${select("[data-pin-input-root]")} { gap: ${safe.groupGap}px; }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		const radius = radiusCss(safe.radius);
		rules.push(
			`${select('[data-slot="input-otp-group"]')} { border-radius: ${radius}; }`,
			`${slot}, ${slot}:first-child, ${slot}:last-child { border-radius: 0; }`,
			`${slot}:first-child { border-top-left-radius: ${radius}; border-bottom-left-radius: ${radius}; }`,
			`${slot}:last-child { border-top-right-radius: ${radius}; border-bottom-right-radius: ${radius}; }`
		);
	}
	return rules.join("\n");
}

const registryOtps = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/input-otp.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const INPUT_OTP_SPEC: TunerSpec<InputOtpValues, InputOtpContext> = {
	component: "input-otp",
	title: "Input OTP",
	description: "槽尺寸与 Button 高度同档；只调分组几何，保留真实验证码输入、粘贴与删除行为",
	storageKey: "valar.input-otp-styles.v2",
	group: "槽尺寸与分组",
	parameters: [
		{ kind: "select", key: "slotSize", label: "方形槽尺寸档位", options: HEIGHT_OPTIONS },
		{ kind: "number", key: "groupGap", label: "组间距（px）", min: 0, max: 24, step: 2 },
		{ kind: "select", key: "radius", label: "分组圆角档位", options: RADIUS_OPTIONS },
	],
	valuesSchema,
	tokens: CONTROL_TOKENS,
	async readBaseline(probe, style) {
		const load =
			registryOtps[`/src/__registry__/json/styles/${style.replace("style-", "")}/input-otp.json`];
		if (!load) throw new Error(`没有 ${style} 的 Input OTP registry`);
		return parseInputOtpSource((await load()).files, {
			buttonHeights: readButtonHeights(probe),
		});
	},
	previewCss: (scope, overrides, context) =>
		inputOtpCss((selector) => `${scope} ${selector}`, overrides, context),
	pageCss: (overrides, context) =>
		inputOtpCss((selector) => `${selector}${NOT_EDITOR}`, overrides, context),
	overrideClasses: inputOtpOverrideClasses,
};
