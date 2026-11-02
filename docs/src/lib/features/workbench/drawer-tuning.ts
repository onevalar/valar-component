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

// Vaul owns drag, snap points and their 500ms runtime timing. Do not offer a CSS-only
// duration/slide override that would disagree with its release and cleanup behavior.
const valuesSchema = z
	.object({
		headerPadding: z.number().int().min(8).max(40).multipleOf(2),
		footerPadding: z.number().int().min(8).max(40).multipleOf(2),
		footerGap: z.number().int().min(0).max(24).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
		overlay: z.number().int().min(0).max(80).multipleOf(10),
	})
	.strict();
export type DrawerValues = z.infer<typeof valuesSchema>;
export type DrawerOverrides = Partial<DrawerValues>;
export type DrawerContext = { insetSurface: boolean };

const EDGES = { bottom: "t", top: "b", left: "r", right: "l" } as const;

export function parseDrawerSource(files: { target: string; content: string }[]): {
	values: DrawerValues;
	context: DrawerContext;
} {
	const file = (name: string) => files.find((f) => f.target.endsWith(name))?.content ?? "";
	const content = file("drawer-content.svelte");
	const header = file("drawer-header.svelte");
	const footer = file("drawer-footer.svelte");
	const overlay = file("drawer-overlay.svelte");
	const insetSurface = content.includes("before:bg-popover");
	const levels = `(${RADIUS_LEVELS.join("|")})`;
	// A tuned edge overrides rounded-none on that edge while keeping the attached edge square.
	const radius = insetSurface
		? sourceWord(`before:rounded-${levels}`, content)
		: (sourceWord(`data-\\[vaul-drawer-direction=bottom\\]:rounded-t-${levels}`, content) ??
			sourceWord(`data-\\[vaul-drawer-direction=bottom\\]:rounded-${levels}`, content));
	const px = (pattern: string, source: string, fallback: number) => {
		const value = sourceWord(pattern, source);
		return value === undefined ? fallback : Number(value) * 4;
	};
	return {
		values: {
			headerPadding: px(String.raw`p-(\d+(?:\.5)?)`, header, 16),
			footerPadding: px(String.raw`p-(\d+(?:\.5)?)`, footer, 16),
			footerGap: px(String.raw`gap-(\d+(?:\.5)?)`, footer, 8),
			radius: (radius as RadiusLevel | undefined) ?? STYLE_VALUE,
			overlay: Number(/bg-black\/(\d+)/.exec(overlay)?.[1] ?? 0),
		},
		context: { insetSurface },
	};
}

const registryDrawers = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/drawer.json",
	{ import: "default" }
);

function drawerCss(
	select: (slot: string) => string,
	overrides: DrawerOverrides,
	context: DrawerContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.headerPadding !== undefined)
		rules.push(`${select("drawer-header")} { padding: ${safe.headerPadding}px; }`);
	if (safe.footerPadding !== undefined)
		rules.push(`${select("drawer-footer")} { padding: ${safe.footerPadding}px; }`);
	if (safe.footerGap !== undefined)
		rules.push(`${select("drawer-footer")} { gap: ${safe.footerGap}px; }`);
	if (safe.overlay !== undefined)
		rules.push(`${select("drawer-overlay")} { background-color: rgb(0 0 0 / ${safe.overlay}%); }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE && context) {
		const radius = radiusCss(safe.radius);
		if (context.insetSurface) {
			rules.push(`${select("drawer-content")}::before { border-radius: ${radius}; }`);
		} else {
			const corners = {
				bottom: ["top-left", "top-right"],
				top: ["bottom-left", "bottom-right"],
				left: ["top-right", "bottom-right"],
				right: ["top-left", "bottom-left"],
			};
			for (const [side, edges] of Object.entries(corners))
				rules.push(
					`${select("drawer-content")}[data-vaul-drawer-direction="${side}"] { ${edges.map((edge) => `border-${edge}-radius: ${radius};`).join(" ")} }`
				);
		}
	}
	return rules.join("\n");
}

export function drawerOverrideClasses(
	overrides: DrawerOverrides,
	context: DrawerContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	const footer: string[] = [];
	if (safe.footerPadding !== undefined) footer.push(`p-${spacing(safe.footerPadding)}`);
	if (safe.footerGap !== undefined) footer.push(`gap-${spacing(safe.footerGap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		if (context.insetSurface) content.push(`before:rounded-${safe.radius}`);
		else
			for (const [side, edge] of Object.entries(EDGES))
				content.push(`data-[vaul-drawer-direction=${side}]:rounded-${edge}-${safe.radius}`);
	}
	return {
		...(content.length ? { "cn-drawer-content": content.join(" ") } : {}),
		...(safe.headerPadding !== undefined
			? { "cn-drawer-header": `p-${spacing(safe.headerPadding)}` }
			: {}),
		...(footer.length ? { "cn-drawer-footer": footer.join(" ") } : {}),
		...(safe.overlay !== undefined ? { "cn-drawer-overlay": `bg-black/${safe.overlay}` } : {}),
	};
}

const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const DRAWER_SPEC: TunerSpec<DrawerValues, DrawerContext> = {
	component: "drawer",
	title: "Drawer",
	description: "调整页眉页脚、圆角与遮罩；拖拽、吸附和动效保持 Vaul 原行为",
	storageKey: "valar.drawer-styles.v2",
	group: "布局与表面",
	parameters: [
		{ kind: "number", key: "headerPadding", label: "页眉内边距（px）", min: 8, max: 40, step: 2 },
		{ kind: "number", key: "footerPadding", label: "页脚内边距（px）", min: 8, max: 40, step: 2 },
		{ kind: "number", key: "footerGap", label: "页脚按钮间距（px）", min: 0, max: 24, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
		{ kind: "number", key: "overlay", label: "遮罩不透明度（%）", min: 0, max: 80, step: 10 },
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--popover", "面板背景"],
		["--popover-foreground", "面板文字"],
		["--border-width", "边框粗细"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryDrawers[`/src/__registry__/json/styles/${style.replace("style-", "")}/drawer.json`];
		if (!load) throw new Error(`没有 ${style} 的 Drawer registry`);
		return parseDrawerSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		drawerCss((slot) => `${scope} [data-slot="${slot}"]`, overrides, context),
	pageCss: (overrides, context) =>
		drawerCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: drawerOverrideClasses,
};
