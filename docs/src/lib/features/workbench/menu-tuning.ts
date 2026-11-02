import { z } from "zod";
import {
	MOTION_TIER_LABELS,
	MOTION_TIERS,
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	readSlide,
	slideClasses,
	slideCss,
	SLIDE_DISTANCES,
	SLIDE_OPTIONS,
	sourceWord,
	spacing,
	STYLE_VALUE,
	tierVar,
	ZOOM_LEVELS,
	type RadiusLevel,
	type TunerSpec,
} from "./tuner.js";

/**
 * Dropdown and Context Menu share layout parameters, but keep their own trigger and anchor.
 * Colors, `--radius` and the motion tier values are global
 * tokens; the menu only picks levels (radius levels, duration tier) and sets its own layout
 * (panel padding and minimum width, item padding and gap) and zoom and slide distance on open.
 */

const valuesSchema = z
	.object({
		padding: z.number().int().min(0).max(12).multipleOf(2),
		minWidth: z.number().int().min(96).max(320).multipleOf(16),
		radius: z.enum(RADIUS_CHOICES),
		itemPaddingX: z.number().int().min(4).max(20).multipleOf(2),
		itemPaddingY: z.number().int().min(2).max(12).multipleOf(2),
		itemGap: z.number().int().min(4).max(16).multipleOf(2),
		itemRadius: z.enum(RADIUS_CHOICES),
		duration: z.enum(MOTION_TIERS),
		zoom: z.enum(ZOOM_LEVELS),
		slide: z.enum(SLIDE_DISTANCES),
	})
	.strict();
export type MenuValues = z.infer<typeof valuesSchema>;
export type MenuOverrides = Partial<MenuValues>;
type MenuComponent = "dropdown-menu" | "context-menu";

/**
 * Style facts the write-back keeps consistent: the inset item indent, the checkbox/radio
 * vertical padding (some styles differ from plain items) and whether separators bleed to the
 * panel edges. Derived values move by the same amount as the parameter they follow.
 */
export type MenuContext = {
	itemPaddingX: number;
	itemPaddingY: number;
	itemGap: number;
	inset: number;
	choicePaddingY: number;
	separatorBleed: boolean;
};

const N = String.raw`(\d+(?:\.\d+)?)`;
/** Reads one menu's own installed source, including style-specific alignment offsets. */
export function parseMenuSource(
	component: MenuComponent,
	files: { target: string; content: string }[]
): {
	values: MenuValues;
	context: MenuContext;
} {
	// Only the class list: `cn(` is followed by the component's base classes.
	const classes = (name: string) => {
		const content =
			files.find((f) => f.target.endsWith(`${component}-${name}.svelte`))?.content ?? "";
		return /cn\(\s*"([^"]*)"/.exec(content)?.[1] ?? "";
	};
	const content = classes("content");
	const item = classes("item");
	const choice = classes("checkbox-item");
	const separator = classes("separator");
	const px = (pattern: string, source: string, fallback: number) => {
		const value = sourceWord(pattern, source);
		return value === undefined ? fallback : Number(value) * 4;
	};
	const radius = (source: string) =>
		(sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, source) as RadiusLevel | undefined) ??
		STYLE_VALUE;
	const padding = px(`p-${N}`, content, 0);
	const itemPaddingX = px(`px-${N}`, item, 8);
	const itemPaddingY = px(`py-${N}`, item, 6);
	const itemGap = px(`gap-${N}`, item, 8);
	const inset = /data-inset:pl-(\d+(?:\.\d+)?)/.exec(item)?.[1];
	return {
		values: {
			padding,
			minWidth: px(`min-w-${N}`, content, 128),
			radius: radius(content),
			itemPaddingX,
			itemPaddingY,
			itemGap,
			itemRadius: radius(item),
			duration: (sourceWord("duration-(fast|normal|slow)", content) ??
				"fast") as MenuValues["duration"],
			zoom: (/data-open:zoom-in-(\d+)/.exec(content)?.[1] ?? "100") as MenuValues["zoom"],
			slide: readSlide(content),
		},
		context: {
			itemPaddingX,
			itemPaddingY,
			itemGap,
			inset: inset === undefined ? itemPaddingX + 16 + itemGap : Number(inset) * 4,
			choicePaddingY: px(`py-${N}`, choice, itemPaddingY),
			separatorBleed: px(`-mx-${N}`, separator, -1) === padding,
		},
	};
}

// The built registry for every style; only the requested one is loaded.
const registryMenus = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/{dropdown-menu,context-menu}.json",
	{ import: "default" }
);

type Derived = {
	panel: {
		padding?: number;
		radius?: RadiusLevel;
		duration?: MenuValues["duration"];
		zoom?: MenuValues["zoom"];
		slide?: MenuValues["slide"];
	};
	minWidth?: number;
	separator?: number;
	item: { px?: number; py?: number; gap?: number; radius?: RadiusLevel; inset?: number };
	choicePy?: number;
};

/** One place that turns parameters into per-part values, shared by preview and write-back. */
function derive(overrides: MenuOverrides, context: MenuContext): Derived {
	const safe = valuesSchema.partial().parse(overrides);
	const level = (value: MenuValues["radius"] | undefined) =>
		value === undefined || value === STYLE_VALUE ? undefined : value;
	const inset =
		safe.itemPaddingX !== undefined || safe.itemGap !== undefined
			? context.inset +
				(safe.itemPaddingX ?? context.itemPaddingX) -
				context.itemPaddingX +
				(safe.itemGap ?? context.itemGap) -
				context.itemGap
			: undefined;
	return {
		panel: {
			padding: safe.padding,
			radius: level(safe.radius),
			duration: safe.duration,
			zoom: safe.zoom,
			slide: safe.slide,
		},
		minWidth: safe.minWidth,
		separator: safe.padding !== undefined && context.separatorBleed ? safe.padding : undefined,
		item: {
			px: safe.itemPaddingX,
			py: safe.itemPaddingY,
			gap: safe.itemGap,
			radius: level(safe.itemRadius),
			inset,
		},
		choicePy:
			safe.itemPaddingY === undefined
				? undefined
				: safe.itemPaddingY + context.choicePaddingY - context.itemPaddingY,
	};
}

const ITEMS = ["item", "sub-trigger"];
const CHOICES = ["checkbox-item", "radio-item"];
const PANELS = ["content", "sub-content"];

/**
 * Live preview. Selectors are built from `slot`; editor elements (`[data-component-tuner]`)
 * are excluded on the page so tuning never restyles the editor itself.
 */
function menuCss(
	select: (slots: string[], suffix?: string) => string,
	overrides: MenuOverrides,
	context: MenuContext | undefined
): string {
	if (!context) return "";
	const { panel, minWidth, separator, item, choicePy } = derive(overrides, context);
	const rules: string[] = [];
	const rule = (slots: string[], declarations: string[], suffix?: string) => {
		if (declarations.length) rules.push(`${select(slots, suffix)} { ${declarations.join(" ")} }`);
	};
	const panelDecls: string[] = [];
	if (panel.padding !== undefined) panelDecls.push(`padding: ${panel.padding}px;`);
	if (panel.radius) panelDecls.push(`border-radius: ${radiusCss(panel.radius)};`);
	if (panel.duration) panelDecls.push(`animation-duration: ${tierVar(panel.duration)};`);
	if (panel.zoom)
		panelDecls.push(
			`--tw-enter-scale: ${Number(panel.zoom) / 100}; --tw-exit-scale: ${Number(panel.zoom) / 100};`
		);
	rule(PANELS, panelDecls);
	if (panel.slide)
		for (const slot of PANELS) rules.push(...slideCss((side) => select([slot], side), panel.slide));
	if (minWidth !== undefined) rule(["content"], [`min-width: ${minWidth}px;`]);
	if (separator !== undefined) rule(["separator"], [`margin-inline: -${separator}px;`]);
	const shared: string[] = [];
	if (item.py !== undefined) shared.push(`padding-block: ${item.py}px;`);
	if (item.gap !== undefined) shared.push(`gap: ${item.gap}px;`);
	if (item.radius) shared.push(`border-radius: ${radiusCss(item.radius)};`);
	rule(ITEMS, [...shared, ...(item.px !== undefined ? [`padding-inline: ${item.px}px;`] : [])]);
	rule(CHOICES, [
		...shared.filter((declaration) => !declaration.startsWith("padding-block")),
		...(choicePy !== undefined ? [`padding-block: ${choicePy}px;`] : []),
		...(item.px !== undefined ? [`padding-left: ${item.px}px;`] : []),
	]);
	if (item.px !== undefined) rule(["label"], [`padding-inline: ${item.px}px;`]);
	if (item.inset !== undefined)
		rule([...ITEMS, ...CHOICES, "label"], [`padding-left: ${item.inset}px;`], "[data-inset]");
	return rules.join("\n");
}

const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export function menuOverrideClasses(
	component: MenuComponent,
	overrides: MenuOverrides,
	context: MenuContext
): Record<string, string> {
	const { panel, minWidth, separator, item, choicePy } = derive(overrides, context);
	const panelClasses: string[] = [];
	if (panel.padding !== undefined) panelClasses.push(`p-${spacing(panel.padding)}`);
	if (panel.radius) panelClasses.push(`rounded-${panel.radius}`);
	if (panel.duration) panelClasses.push(`duration-${panel.duration}`);
	if (panel.zoom)
		panelClasses.push(`data-open:zoom-in-${panel.zoom}`, `data-closed:zoom-out-${panel.zoom}`);
	if (panel.slide) panelClasses.push(...slideClasses(panel.slide));
	const shared: string[] = [];
	if (item.gap !== undefined) shared.push(`gap-${spacing(item.gap)}`);
	if (item.radius) shared.push(`rounded-${item.radius}`);
	if (item.inset !== undefined) shared.push(`data-inset:pl-${spacing(item.inset)}`);
	const itemClasses = [
		...shared,
		...(item.px !== undefined ? [`px-${spacing(item.px)}`] : []),
		...(item.py !== undefined ? [`py-${spacing(item.py)}`] : []),
	];
	const choiceClasses = [
		...shared,
		...(item.px !== undefined ? [`pl-${spacing(item.px)}`] : []),
		...(choicePy !== undefined ? [`py-${spacing(choicePy)}`] : []),
	];
	const label = [
		...(item.px !== undefined ? [`px-${spacing(item.px)}`] : []),
		...(item.inset !== undefined ? [`data-inset:pl-${spacing(item.inset)}`] : []),
	];
	return Object.fromEntries(
		[
			[
				`cn-${component}-content`,
				[...panelClasses, ...(minWidth !== undefined ? [`min-w-${spacing(minWidth)}`] : [])],
			],
			[`cn-${component}-sub-content`, panelClasses],
			[`cn-${component}-item`, itemClasses],
			[`cn-${component}-sub-trigger`, itemClasses],
			[`cn-${component}-checkbox-item`, choiceClasses],
			[`cn-${component}-radio-item`, choiceClasses],
			[`cn-${component}-label`, label],
			[`cn-${component}-separator`, separator !== undefined ? [`-mx-${spacing(separator)}`] : []],
		]
			.filter(([, list]) => list.length)
			.map(([className, list]) => [className, (list as string[]).join(" ")])
	);
}

const radiusOptions = [
	{ value: STYLE_VALUE, label: "样式自带" },
	...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
];

export function createMenuSpec(
	component: MenuComponent,
	title: string,
	description: string
): TunerSpec<MenuValues, MenuContext> {
	// Context GroupHeading and Label share one style class but expose different slots.
	const slotsFor = (slots: string[]) =>
		slots.flatMap((slot) =>
			component === "context-menu" && slot === "label" ? ["label", "group-heading"] : [slot]
		);
	return {
		component,
		title,
		description,
		storageKey: `valar.${component}-styles.v2`,
		group: "面板、菜单项与动效",
		parameters: [
			{ kind: "number", key: "padding", label: "面板内边距（px）", min: 0, max: 12, step: 2 },
			{ kind: "number", key: "minWidth", label: "最小宽度（px）", min: 96, max: 320, step: 16 },
			{ kind: "select", key: "radius", label: "面板圆角档位", options: radiusOptions },
			{
				kind: "number",
				key: "itemPaddingX",
				label: "菜单项横向内边距（px）",
				min: 4,
				max: 20,
				step: 2,
			},
			{
				kind: "number",
				key: "itemPaddingY",
				label: "菜单项纵向内边距（px）",
				min: 2,
				max: 12,
				step: 2,
			},
			{ kind: "number", key: "itemGap", label: "图文间距（px）", min: 4, max: 16, step: 2 },
			{ kind: "select", key: "itemRadius", label: "菜单项圆角档位", options: radiusOptions },
			{
				kind: "select",
				key: "duration",
				label: "动效档位",
				options: MOTION_TIERS.map((value) => ({ value, label: MOTION_TIER_LABELS[value] })),
			},
			{
				kind: "select",
				key: "zoom",
				label: "出现时缩放",
				options: [
					{ value: "90", label: "90% · 明显" },
					{ value: "95", label: "95% · 轻微" },
					{ value: "100", label: "100% · 不缩放" },
				],
			},
			{ kind: "select", key: "slide", label: "出现时滑入距离", options: SLIDE_OPTIONS },
		],
		valuesSchema,
		tokens: [
			["--radius", "圆角基数"],
			["--motion-duration-fast", "快档时长"],
			["--motion-duration-normal", "中档时长"],
			["--motion-duration-slow", "慢档时长"],
			["--popover", "面板背景"],
			["--accent", "高亮背景"],
		],
		async readBaseline(_probe, style) {
			const load =
				registryMenus[
					`/src/__registry__/json/styles/${style.replace("style-", "")}/${component}.json`
				];
			if (!load) throw new Error(`没有 ${style} 的 ${title} registry`);
			return parseMenuSource(component, (await load()).files);
		},
		previewCss: (scope, overrides, context) =>
			menuCss(
				(slots, suffix = "") =>
					slotsFor(slots)
						.map((slot) => `${scope} [data-slot="${component}-${slot}"]${suffix}`)
						.join(", "),
				overrides,
				context
			),
		pageCss: (overrides, context) =>
			menuCss(
				(slots, suffix = "") =>
					slotsFor(slots)
						.map((slot) => `[data-slot="${component}-${slot}"]${suffix}${NOT_EDITOR}`)
						.join(", "),
				overrides,
				context
			),
		overrideClasses: (overrides, context) => menuOverrideClasses(component, overrides, context),
	};
}
