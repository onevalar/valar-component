import { z } from "zod";
import {
	MOTION_TIERS,
	MOTION_TIER_LABELS,
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	spacing,
	STYLE_VALUE,
	tierVar,
	type TunerSpec,
} from "./tuner.js";

const DURATIONS = [STYLE_VALUE, ...MOTION_TIERS] as const;
const valuesSchema = z
	.object({
		thumbHeight: z.number().int().min(10).max(24).multipleOf(2),
		smallThumbHeight: z.number().int().min(10).max(24).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
		duration: z.enum(DURATIONS),
	})
	.strict();
export type SwitchValues = z.infer<typeof valuesSchema>;
export type SwitchOverrides = Partial<SwitchValues>;
type Geometry = { height: number; width: number; thumbHeight: number; thumbWidth: number };
export type SwitchContext = Record<"default" | "sm", Geometry>;

/** Read each size's real geometry, including Luma's wide thumb and fractional track heights. */
export function parseSwitchSource(files: { target: string; content: string }[]): {
	values: SwitchValues;
	context: SwitchContext;
} {
	const source = files.find((file) => file.target.endsWith("/switch.svelte"))?.content ?? "";
	const [root, thumb] = [...source.matchAll(/cn\(\s*"([^"]*)"/g)].map((match) => match[1]);
	if (!root || !thumb) throw new Error("Switch registry 缺少轨道或滑块样式");
	const dimension = (classes: string, prefix: string, axis: "h" | "w") => {
		const tokens = classes.split(/\s+/);
		const token =
			tokens.find((token) => token.startsWith(`${prefix}${axis}-`)) ??
			tokens.find((token) => token.startsWith(`${prefix}size-`));
		if (!token) throw new Error(`Switch registry 缺少 ${prefix}${axis}`);
		const value = token.slice(token.lastIndexOf(":") + 1).replace(/^(?:size|h|w)-/, "");
		const pixels = /^\[([\d.]+)px\]$/.exec(value);
		return pixels ? Number(pixels[1]) : Number(value) * 4;
	};
	const geometry = (size: "default" | "sm"): Geometry => ({
		height: dimension(root, `data-[size=${size}]:`, "h"),
		width: dimension(root, `data-[size=${size}]:`, "w"),
		thumbHeight: dimension(thumb, `group-data-[size=${size}]/switch:`, "h"),
		thumbWidth: dimension(thumb, `group-data-[size=${size}]/switch:`, "w"),
	});
	const radius = (classes: string) =>
		classes
			.split(/\s+/)
			.find((token) => /^rounded-/.test(token))
			?.slice(8);
	const rootRadius = radius(root);
	const thumbRadius = radius(thumb);
	const rootDuration = root
		.split(/\s+/)
		.find((token) => /^duration-/.test(token))
		?.slice(9);
	const thumbDuration = thumb
		.split(/\s+/)
		.find((token) => /^duration-/.test(token))
		?.slice(9);
	const context = { default: geometry("default"), sm: geometry("sm") };
	return {
		values: valuesSchema.parse({
			thumbHeight: context.default.thumbHeight,
			smallThumbHeight: context.sm.thumbHeight,
			radius:
				rootRadius === thumbRadius && RADIUS_LEVELS.some((level) => level === rootRadius)
					? rootRadius
					: STYLE_VALUE,
			duration:
				rootDuration === thumbDuration && MOTION_TIERS.some((tier) => tier === rootDuration)
					? rootDuration
					: STYLE_VALUE,
		}),
		context,
	};
}

/** Growing the track by twice the thumb's width change preserves its existing endpoint offset. */
function resized(base: Geometry, thumbHeight: number): Geometry {
	const delta = thumbHeight - base.thumbHeight;
	const round = (value: number) => Math.round(value * 100) / 100;
	return {
		height: round(base.height + delta),
		width: round(base.width + delta * 2),
		thumbHeight,
		thumbWidth: round(base.thumbWidth + delta),
	};
}

export function switchOverrideClasses(
	overrides: SwitchOverrides,
	context: SwitchContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	const thumb: string[] = [];
	for (const [size, value] of [
		["default", safe.thumbHeight],
		["sm", safe.smallThumbHeight],
	] as const) {
		if (value === undefined) continue;
		const next = resized(context[size], value);
		root.push(
			// Tailwind accepts quarter-step spacing, not h-5.6; preserve the source's pixel inset.
			`data-[size=${size}]:h-${Number.isInteger(next.height) ? spacing(next.height) : `[${next.height}px]`}`,
			`data-[size=${size}]:w-${spacing(next.width)}`
		);
		thumb.push(
			`group-data-[size=${size}]/switch:h-${spacing(next.thumbHeight)}`,
			`group-data-[size=${size}]/switch:w-${spacing(next.thumbWidth)}`
		);
	}
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		root.push(`rounded-${safe.radius}`);
		thumb.push(`rounded-${safe.radius}`);
	}
	if (safe.duration !== undefined && safe.duration !== STYLE_VALUE) {
		root.push(`duration-${safe.duration}`);
		thumb.push(`duration-${safe.duration}`);
	}
	return Object.fromEntries(
		[
			["cn-switch", root],
			["cn-switch-thumb", thumb],
		]
			.filter(([, classes]) => classes.length)
			.map(([key, classes]) => [key, (classes as string[]).join(" ")])
	);
}

function switchCss(
	select: (slot: string) => string,
	overrides: SwitchOverrides,
	context: SwitchContext
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const root = select("switch");
	const thumb = select("switch-thumb");
	const rules: string[] = [];
	for (const [size, value] of [
		["default", safe.thumbHeight],
		["sm", safe.smallThumbHeight],
	] as const) {
		if (value === undefined) continue;
		const next = resized(context[size], value);
		rules.push(
			`${root}[data-size="${size}"] { height: ${next.height}px; width: ${next.width}px; }`,
			`${root}[data-size="${size}"] > [data-slot="switch-thumb"] { height: ${next.thumbHeight}px; width: ${next.thumbWidth}px; }`
		);
	}
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		rules.push(`${root}, ${thumb} { border-radius: ${radiusCss(safe.radius)}; }`);
	if (safe.duration !== undefined && safe.duration !== STYLE_VALUE)
		rules.push(`${root}, ${thumb} { transition-duration: ${tierVar(safe.duration)}; }`);
	return rules.join("\n");
}

const registrySwitches = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/switch.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const SWITCH_SPEC: TunerSpec<SwitchValues, SwitchContext> = {
	component: "switch",
	title: "Switch",
	description: "尺寸联动轨道与滑块，保留各样式的形状、端点留白和真实开关行为",
	storageKey: "valar.switch-styles.v2",
	group: "尺寸与动效",
	parameters: [
		{
			kind: "number",
			key: "thumbHeight",
			label: "默认尺寸滑块高度（px）",
			min: 10,
			max: 24,
			step: 2,
		},
		{
			kind: "number",
			key: "smallThumbHeight",
			label: "小尺寸滑块高度（px）",
			min: 10,
			max: 24,
			step: 2,
		},
		{
			kind: "select",
			key: "radius",
			label: "轨道与滑块圆角",
			options: RADIUS_CHOICES.map((value) => ({
				value,
				label: value === STYLE_VALUE ? "样式自带" : RADIUS_LABELS[value],
			})),
		},
		{
			kind: "select",
			key: "duration",
			label: "切换动效档位",
			options: DURATIONS.map((value) => ({
				value,
				label: value === STYLE_VALUE ? "样式自带" : MOTION_TIER_LABELS[value],
			})),
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--primary", "选中轨道"],
		["--input", "未选中轨道"],
		["--ring", "焦点环"],
		["--motion-duration-fast", "快速动效"],
		["--motion-duration-normal", "常规动效"],
		["--motion-duration-slow", "慢速动效"],
	],
	async readBaseline(_probe, style) {
		const load =
			registrySwitches[`/src/__registry__/json/styles/${style.replace("style-", "")}/switch.json`];
		if (!load) throw new Error(`没有 ${style} 的 Switch registry`);
		return parseSwitchSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		switchCss((slot) => `${scope} [data-slot="${slot}"]`, overrides, context),
	pageCss: (overrides, context) =>
		switchCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: switchOverrideClasses,
};
