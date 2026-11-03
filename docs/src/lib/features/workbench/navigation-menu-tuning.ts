import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	STYLE_VALUE,
	radiusCss,
	sourceWord,
	spacing,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		gap: z.number().int().min(0).max(24).multipleOf(2),
		triggerPaddingX: z.number().int().min(0).max(32).multipleOf(2),
		triggerRadius: z.enum(RADIUS_CHOICES),
		contentPadding: z.number().int().min(0).max(24).multipleOf(2),
		panelRadius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type NavigationMenuValues = z.infer<typeof valuesSchema>;
export type NavigationMenuOverrides = Partial<NavigationMenuValues>;
export type NavigationMenuContext = { contentRightDelta: number };

/** Read installed source, not a style-name table. Literal h-9 after the trigger anchor is
 * intentionally not editable; vertical padding, Button typography and links remain owned
 * by their original components. Both viewport modes share the same content padding. */
export function parseNavigationMenuSource(files: { target: string; content: string }[]): {
	values: NavigationMenuValues;
	context: NavigationMenuContext;
} {
	const classes = (part: string) => {
		const source = files.find((file) =>
			file.target.endsWith(`navigation-menu-${part}.svelte`)
		)?.content;
		const result =
			source &&
			(part === "trigger"
				? /base:\s*"([^"]*)"/.exec(source)?.[1]
				: new RegExp(
						`data-slot="navigation-menu-${part}"[\\s\\S]*?class=\\{cn\\(\\s*"([^"]*)"`
					).exec(source)?.[1]);
		if (result === undefined) throw new Error(`Navigation Menu registry 缺少 ${part} 入口`);
		return result;
	};
	const read = (utility: string, source: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.\\d+)?)`, source);
		if (value === undefined) throw new Error(`Navigation Menu registry 缺少 ${utility} 几何`);
		return Number(value) * 4;
	};
	const radius = (source: string) =>
		sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, source) ?? STYLE_VALUE;
	const content = classes("content");
	const trigger = classes("trigger");
	const contentPadding = read("p", content);
	const right = sourceWord("pr-(\\d+(?:\\.\\d+)?)", content);
	const viewportRadius = radius(classes("viewport"));
	const inlineRadius =
		/(?:^|\s)group-data-\[viewport=false\]\/navigation-menu:rounded-([\w-]+)(?:\s|$)/.exec(
			content
		)?.[1];
	return {
		values: valuesSchema.parse({
			gap: read("gap", classes("list")),
			triggerPaddingX: read("px", trigger),
			triggerRadius: radius(trigger),
			contentPadding,
			panelRadius: viewportRadius === inlineRadius ? viewportRadius : STYLE_VALUE,
		}),
		context: { contentRightDelta: right === undefined ? 0 : Number(right) * 4 - contentPadding },
	};
}

export function navigationMenuOverrideClasses(
	overrides: NavigationMenuOverrides,
	context: NavigationMenuContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const trigger: string[] = [];
	const content: string[] = [];
	if (safe.triggerPaddingX !== undefined) trigger.push(`px-${spacing(safe.triggerPaddingX)}`);
	if (safe.triggerRadius !== undefined && safe.triggerRadius !== STYLE_VALUE)
		trigger.push(`rounded-${safe.triggerRadius}`);
	if (safe.contentPadding !== undefined)
		content.push(
			`p-${spacing(safe.contentPadding)}`,
			`pr-${spacing(safe.contentPadding + context.contentRightDelta)}`
		);
	if (safe.panelRadius !== undefined && safe.panelRadius !== STYLE_VALUE)
		content.push(`group-data-[viewport=false]/navigation-menu:rounded-${safe.panelRadius}`);
	return {
		...(safe.gap !== undefined ? { "cn-navigation-menu-list": `gap-${spacing(safe.gap)}` } : {}),
		...(trigger.length ? { "cn-navigation-menu-trigger": trigger.join(" ") } : {}),
		...(content.length ? { "cn-navigation-menu-content": content.join(" ") } : {}),
		...(safe.panelRadius !== undefined && safe.panelRadius !== STYLE_VALUE
			? { "cn-navigation-menu-viewport": `rounded-${safe.panelRadius}` }
			: {}),
	};
}

function navigationMenuCss(
	select: (slot: string, inline?: boolean) => string,
	overrides: NavigationMenuOverrides,
	context: NavigationMenuContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	if (!context) return "";
	const rules: string[] = [];
	if (safe.gap !== undefined) rules.push(`${select("list")} { gap: ${safe.gap}px; }`);
	if (safe.triggerPaddingX !== undefined)
		rules.push(`${select("trigger")} { padding-inline: ${safe.triggerPaddingX}px; }`);
	if (safe.triggerRadius !== undefined && safe.triggerRadius !== STYLE_VALUE)
		rules.push(`${select("trigger")} { border-radius: ${radiusCss(safe.triggerRadius)}; }`);
	if (safe.contentPadding !== undefined)
		rules.push(
			`${select("content")} { padding: ${safe.contentPadding}px; padding-right: ${safe.contentPadding + context.contentRightDelta}px; }`
		);
	if (safe.panelRadius !== undefined && safe.panelRadius !== STYLE_VALUE)
		rules.push(
			`${select("viewport")}, ${select("content", true)} { border-radius: ${radiusCss(safe.panelRadius)}; }`
		);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/navigation-menu.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
const radiusOptions = RADIUS_CHOICES.map((value) => ({
	value,
	label: value === STYLE_VALUE ? "样式自带" : RADIUS_LABELS[value],
}));
export const NAVIGATION_MENU_SPEC: TunerSpec<NavigationMenuValues, NavigationMenuContext> = {
	component: "navigation-menu",
	title: "Navigation Menu",
	description:
		"只调整导航间距、触发器横向留白／圆角与面板留白／圆角；保留两种 viewport 布局及本地链接",
	storageKey: "valar.navigation-menu-styles.v2",
	group: "导航与面板几何",
	parameters: [
		{ kind: "number", key: "gap", label: "导航项间距（px）", min: 0, max: 24, step: 2 },
		{
			kind: "number",
			key: "triggerPaddingX",
			label: "触发器横向留白（px）",
			min: 0,
			max: 32,
			step: 2,
		},
		{ kind: "select", key: "triggerRadius", label: "触发器圆角档位", options: radiusOptions },
		{ kind: "number", key: "contentPadding", label: "面板内边距（px）", min: 0, max: 24, step: 2 },
		{
			kind: "select",
			key: "panelRadius",
			label: "面板圆角档位（两种布局）",
			options: radiusOptions,
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--popover", "面板背景"],
		["--muted", "导航高亮"],
		["--ring", "焦点环"],
		["--text-sm", "导航字号"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/navigation-menu.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Navigation Menu registry`);
		return parseNavigationMenuSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		navigationMenuCss(
			(slot, inline) =>
				`${scope} ${inline ? '[data-slot="navigation-menu"][data-viewport="false"] ' : ""}[data-slot="navigation-menu-${slot}"]`,
			overrides,
			context
		),
	pageCss: (overrides, context) =>
		navigationMenuCss(
			(slot, inline) =>
				`${inline ? '[data-slot="navigation-menu"][data-viewport="false"] ' : ""}[data-slot="navigation-menu-${slot}"]${NOT_EDITOR}`,
			overrides,
			context
		),
	overrideClasses: navigationMenuOverrideClasses,
};
