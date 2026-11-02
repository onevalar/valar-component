import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	sourceWord,
	spacing,
	STYLE_VALUE,
	type RadiusLevel,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		joinedPaddingX: z.number().int().min(0).max(48).multipleOf(2),
		joinedRadius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type ToggleGroupValues = z.infer<typeof valuesSchema>;
export type ToggleGroupOverrides = Partial<ToggleGroupValues>;
export type ToggleGroupContext = null;

const JOINED = "group-data-[spacing=0]/toggle-group:";
const OUTLINE = "data-[spacing=0]:data-[variant=outline]:";
const ENDS = [
	["horizontal", "first", "l"],
	["horizontal", "last", "r"],
	["vertical", "first", "t"],
	["vertical", "last", "b"],
] as const;
const endPrefix = (orientation: string, end: string) =>
	`group-data-${orientation}/toggle-group:data-[spacing=0]:${end}:`;

function sourceClasses(files: { target: string; content: string }[], name: string): string {
	const file = files.find((file) => file.target.split("/").at(-1) === `${name}.svelte`);
	const classes = /cn\(\s*"([^"]*)"/.exec(file?.content ?? "")?.[1];
	if (classes === undefined) throw new Error(`Toggle Group registry 缺少 ${name} 的样式`);
	return classes;
}

/** Do not present Maia's mismatched contour or Nova/Mira's small-size cap as a uniform level. */
function joinedRadius(root: string, item: string): ToggleGroupValues["joinedRadius"] {
	const rootTokens = root.split(/\s+/);
	const itemTokens = item.split(/\s+/);
	const value = (tokens: string[], prefix: string) =>
		tokens.find((token) => token.startsWith(prefix))?.slice(prefix.length);
	// Some styles only paint a contour on the joined outline variant.
	const outline = value(rootTokens, `${OUTLINE}rounded-`);
	const base = value(rootTokens, "rounded-") ?? outline;
	const small = value(rootTokens, "data-[size=sm]:rounded-") ?? base;
	const radii = [
		base,
		small,
		outline ?? base,
		...ENDS.map(([orientation, end, side]) => {
			const prefix = endPrefix(orientation, end);
			return (
				value(itemTokens, `${prefix}rounded-${side}-`) ?? value(itemTokens, `${prefix}rounded-`)
			);
		}),
	];
	return RADIUS_LEVELS.includes(base as RadiusLevel) && radii.every((radius) => radius === base)
		? (base as RadiusLevel)
		: STYLE_VALUE;
}

/** Reads this group's flattened sources; shared heights, free-item geometry and gaps belong to Toggle. */
export function parseToggleGroupSource(files: { target: string; content: string }[]): {
	values: ToggleGroupValues;
	context: ToggleGroupContext;
} {
	const root = sourceClasses(files, "toggle-group");
	const item = sourceClasses(files, "toggle-group-item");
	const padding = sourceWord(
		String.raw`group-data-\[spacing=0\]/toggle-group:px-(\d+(?:\.5)?)`,
		item
	);
	if (padding === undefined) throw new Error("Toggle Group registry 缺少拼接项横向内边距");
	return {
		values: valuesSchema.parse({
			joinedPaddingX: Number(padding) * 4,
			joinedRadius: joinedRadius(root, item),
		}),
		context: null,
	};
}

export function toggleGroupOverrideClasses(
	overrides: ToggleGroupOverrides
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	const item: string[] = [];
	if (safe.joinedPaddingX !== undefined) item.push(`${JOINED}px-${spacing(safe.joinedPaddingX)}`);
	if (safe.joinedRadius !== undefined && safe.joinedRadius !== STYLE_VALUE) {
		const radius = safe.joinedRadius;
		// Explicitly replace both higher-specificity contour rules as well as the base radius.
		root.push(
			`rounded-${radius}`,
			`data-[size=sm]:rounded-${radius}`,
			`${OUTLINE}rounded-${radius}`
		);
		item.push(`${JOINED}rounded-none`);
		for (const [orientation, end, side] of ENDS)
			item.push(`${endPrefix(orientation, end)}rounded-${side}-${radius}`);
	}
	return Object.fromEntries(
		[
			["cn-toggle-group", root],
			["cn-toggle-group-item", item],
		]
			.filter(([, classes]) => classes.length)
			.map(([key, classes]) => [key, (classes as string[]).join(" ")])
	);
}

function toggleGroupCss(select: (slot: string) => string, overrides: ToggleGroupOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const root = select("toggle-group");
	// The root already owns the pane/page scope; repeating it after `>` would never match.
	const item = '[data-slot="toggle-group-item"]';
	const joined = `${root}[data-spacing="0"] > ${item}[data-spacing="0"]`;
	if (safe.joinedPaddingX !== undefined) {
		// The group-specific icon-side classes stay untouched, just like Button's contract.
		rules.push(
			`${joined}:not(:has([data-icon="inline-start"])) { padding-left: ${safe.joinedPaddingX}px; }`,
			`${joined}:not(:has([data-icon="inline-end"])) { padding-right: ${safe.joinedPaddingX}px; }`
		);
	}
	if (safe.joinedRadius !== undefined && safe.joinedRadius !== STYLE_VALUE) {
		const radius = radiusCss(safe.joinedRadius);
		rules.push(
			`${root}, ${root}[data-size="sm"], ${root}[data-spacing="0"][data-variant="outline"] { border-radius: ${radius}; }`,
			`${joined} { border-radius: 0; }`
		);
		for (const [orientation, end, side] of ENDS) {
			const corners = {
				l: ["top-left", "bottom-left"],
				r: ["top-right", "bottom-right"],
				t: ["top-left", "top-right"],
				b: ["bottom-left", "bottom-right"],
			}[side];
			const endpoint = `${root}[data-orientation="${orientation}"][data-spacing="0"] > ${item}[data-spacing="0"]:${end}-child`;
			rules.push(
				`${endpoint} { ${corners.map((corner) => `border-${corner}-radius: ${radius};`).join(" ")} }`
			);
		}
	}
	return rules.join("\n");
}

const registryGroups = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/toggle-group.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const TOGGLE_GROUP_SPEC: TunerSpec<ToggleGroupValues, ToggleGroupContext> = {
	component: "toggle-group",
	title: "Toggle Group",
	description: "调整拼接项留白与圆角；高度、非拼接几何和图文间距统一由 Toggle 编辑器调整",
	storageKey: "valar.toggle-group-styles.v2",
	group: "拼接几何",
	parameters: [
		{
			kind: "number",
			key: "joinedPaddingX",
			label: "拼接项文字侧内边距（px）",
			min: 0,
			max: 48,
			step: 2,
		},
		{
			kind: "select",
			key: "joinedRadius",
			label: "拼接圆角档位",
			options: RADIUS_CHOICES.map((value) => ({
				value,
				label: value === STYLE_VALUE ? "样式自带（保留轮廓／端点差异）" : RADIUS_LABELS[value],
			})),
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--muted", "选中背景"],
		["--foreground", "文字"],
		["--input", "轮廓边框"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryGroups[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/toggle-group.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Toggle Group registry`);
		return parseToggleGroupSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		toggleGroupCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => toggleGroupCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: toggleGroupOverrideClasses,
};
