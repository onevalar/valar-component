import { cn } from "cn";
import { z } from "zod";
import { frameTokensSchema } from "./tuner-frame.js";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

export const sidebarValuesSchema = z
	.object({
		width: z.number().int().min(192).max(384).multipleOf(8),
		menuGap: z.number().int().min(0).max(12),
	})
	.strict();
export const sidebarOverridesSchema = sidebarValuesSchema.partial();
export type SidebarValues = z.infer<typeof sidebarValuesSchema>;
export type SidebarOverrides = z.infer<typeof sidebarOverridesSchema>;
export type SidebarContext = null;

export const sidebarPreviewUpdateSchema = z
	.object({
		type: z.literal("valar-sidebar-preview"),
		action: z.literal("update"),
		revision: z.number().int().positive(),
		style: z.literal("style-valar"),
		dark: z.boolean(),
		overrides: sidebarOverridesSchema,
		tokens: frameTokensSchema,
	})
	.strict();
export type SidebarPreviewUpdate = z.infer<typeof sidebarPreviewUpdateSchema>;

/** Read the actual style's installable source, including an unwritten constants fallback. */
export function parseSidebarSource(files: { target: string; content: string }[]): {
	values: SidebarValues;
	context: SidebarContext;
} {
	const file = (name: string) => {
		const source = files.find((entry) => entry.target.split("/").at(-1) === name)?.content;
		if (source === undefined) throw new Error(`Sidebar registry 缺少 ${name}`);
		return source;
	};
	const classes = (source: string, slot: string) => {
		const args = new RegExp(`data-slot="${slot}"[\\s\\S]*?class=\\{cn\\(([\\s\\S]*?)\\)\\}`).exec(
			source
		)?.[1];
		if (!args) throw new Error(`Sidebar registry 缺少 ${slot} 样式`);
		return cn(...[...args.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	};
	const provider = classes(file("sidebar-provider.svelte"), "sidebar-wrapper");
	const widthClass = provider
		.split(/\s+/)
		.find((token) => token.startsWith("[--sidebar-width-default:"));
	let widthRem: string | undefined;
	if (widthClass !== undefined) {
		widthRem = /^\[--sidebar-width-default:(\d+(?:\.\d+)?)rem\]$/.exec(widthClass)?.[1];
	} else {
		widthRem = /\bSIDEBAR_WIDTH\s*=\s*["'](\d+(?:\.\d+)?)rem["']/.exec(file("constants.ts"))?.[1];
	}
	if (widthRem === undefined) throw new Error("Sidebar registry 展开宽度不是支持的 rem 默认值");
	const menu = classes(file("sidebar-menu.svelte"), "sidebar-menu");
	const gap = sourceWord(String.raw`gap-(px|\d+(?:\.\d+)?)`, menu);
	if (gap === undefined) throw new Error("Sidebar registry 缺少菜单间距");
	return {
		values: sidebarValuesSchema.parse({
			width: Number(widthRem) * 16,
			menuGap: gap === "px" ? 1 : Number(gap) * 4,
		}),
		context: null,
	};
}

export function sidebarOverrideClasses(overrides: SidebarOverrides): Record<string, string> {
	const safe = sidebarOverridesSchema.parse(overrides);
	return {
		...(safe.width !== undefined
			? { "cn-sidebar-provider": `[--sidebar-width-default:${safe.width / 16}rem]` }
			: {}),
		...(safe.menuGap !== undefined
			? { "cn-sidebar-menu": safe.menuGap === 1 ? "gap-px" : `gap-${spacing(safe.menuGap)}` }
			: {}),
	};
}

function sidebarCss(scope: string, overrides: SidebarOverrides): string {
	const safe = sidebarOverridesSchema.parse(overrides);
	return [
		safe.width !== undefined
			? `${scope} [data-slot="sidebar-wrapper"] { --sidebar-width-default: ${safe.width / 16}rem; }`
			: "",
		safe.menuGap !== undefined
			? `${scope} [data-slot="sidebar-menu"] { gap: ${safe.menuGap === 1 ? "1px" : `calc(${spacing(safe.menuGap)} * var(--spacing))`}; }`
			: "",
	]
		.filter(Boolean)
		.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/sidebar.json",
	{ import: "default" }
);

export const SIDEBAR_SPEC: TunerSpec<SidebarValues, SidebarContext> = {
	component: "sidebar",
	title: "Sidebar",
	description: "仅调整展开宽度与菜单间距；保留图标折叠、移动抽屉、快捷键与菜单按钮尺寸",
	storageKey: "valar.sidebar-styles.v2",
	group: "应用壳布局",
	parameters: [
		{ kind: "number", key: "width", label: "展开宽度（标称 px）", min: 192, max: 384, step: 8 },
		{ kind: "number", key: "menuGap", label: "菜单间距（标称 px）", min: 0, max: 12, step: 1 },
	],
	valuesSchema: sidebarValuesSchema,
	tokens: [
		["--spacing", "间距基数（1px 菜单间距除外）"],
		["--radius", "圆角基数"],
		["--background", "主区背景"],
		["--foreground", "主区文字"],
		["--sidebar", "侧栏背景"],
		["--sidebar-foreground", "侧栏文字"],
		["--sidebar-accent", "侧栏强调背景"],
		["--sidebar-accent-foreground", "侧栏强调文字"],
		["--sidebar-border", "侧栏边框"],
		["--sidebar-ring", "侧栏焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/sidebar.json`];
		if (!load) throw new Error(`没有 ${style} 的 Sidebar registry`);
		return parseSidebarSource((await load()).files);
	},
	previewCss: (scope, overrides) => sidebarCss(scope, overrides),
	overrideClasses: sidebarOverrideClasses,
};
