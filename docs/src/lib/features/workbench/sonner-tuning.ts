import { z } from "zod";
import { frameTokensSchema } from "./tuner-frame.js";
import { spacing, type TunerSpec } from "./tuner.js";

export const sonnerValuesSchema = z
	.object({
		paddingX: z.number().int().min(0).max(32).multipleOf(2),
		paddingY: z.number().int().min(0).max(24).multipleOf(2),
		contentGap: z.number().int().min(0).max(16).multipleOf(2),
	})
	.strict();
export const sonnerOverridesSchema = sonnerValuesSchema.partial();
export type SonnerValues = z.infer<typeof sonnerValuesSchema>;
export type SonnerOverrides = z.infer<typeof sonnerOverridesSchema>;
export type SonnerContext = null;

export const sonnerPreviewUpdateSchema = z
	.object({
		type: z.literal("valar-sonner-preview"),
		action: z.literal("update"),
		revision: z.number().int().positive(),
		style: z.literal("style-valar"),
		dark: z.boolean(),
		overrides: sonnerOverridesSchema,
		tokens: frameTokensSchema,
	})
	.strict();
export type SonnerPreviewUpdate = z.infer<typeof sonnerPreviewUpdateSchema>;

const variables = {
	paddingX: "--valar-toast-padding-x",
	paddingY: "--valar-toast-padding-y",
	contentGap: "--valar-toast-gap",
} as const;

/** Read only the default toast class: callers' explicit toastOptions remain a whole replacement. */
export function parseSonnerSource(files: { target: string; content: string }[]): {
	values: SonnerValues;
	context: SonnerContext;
} {
	const source = files.find((file) => file.target.split("/").at(-1) === "sonner.svelte")?.content;
	if (source === undefined) throw new Error("Sonner registry 缺少 sonner.svelte");
	const classes = /\btoast:\s*"([^"]*)"/.exec(source)?.[1];
	if (!classes?.split(/\s+/).includes("cn-toast")) {
		throw new Error("Sonner registry 缺少默认 cn-toast 样式");
	}
	// svelte-sonner 1.2.1's styled defaults, also the wrapper's guarded CSS fallbacks.
	// Existing generated registries without the new anchor still have these exact defaults.
	const values: SonnerValues = { paddingX: 16, paddingY: 16, contentGap: 6 };
	for (const key of Object.keys(variables) as (keyof SonnerValues)[]) {
		const prefix = `[${variables[key]}:`;
		const tokens = classes.split(/\s+/).filter((token) => token.startsWith(prefix));
		if (tokens.length > 1) throw new Error(`Sonner registry ${key} 样式重复`);
		if (!tokens.length) continue;
		const match =
			/^\[--valar-toast-(?:padding-x|padding-y|gap):--spacing\((\d+(?:\.\d+)?)\)\]$/.exec(
				tokens[0]!
			);
		if (!match) throw new Error(`Sonner registry ${key} 不是支持的 spacing 变量工具类`);
		values[key] = Number(match[1]) * 4;
	}
	return { values: sonnerValuesSchema.parse(values), context: null };
}

export function sonnerOverrideClasses(overrides: SonnerOverrides): Record<string, string> {
	const safe = sonnerOverridesSchema.parse(overrides);
	const classes = (Object.keys(variables) as (keyof SonnerValues)[])
		.filter((key) => safe[key] !== undefined)
		.map((key) => `[${variables[key]}:--spacing(${spacing(safe[key]!)})]`);
	return classes.length ? { "cn-sonner-layout": classes.join(" ") } : {};
}

function sonnerCss(selector: string, overrides: SonnerOverrides): string {
	const safe = sonnerOverridesSchema.parse(overrides);
	const declarations = (Object.keys(variables) as (keyof SonnerValues)[])
		.filter((key) => safe[key] !== undefined)
		.map((key) => `${variables[key]}: calc(var(--spacing) * ${spacing(safe[key]!)});`);
	return declarations.length ? `${selector} { ${declarations.join(" ")} }` : "";
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/sonner.json",
	{ import: "default" }
);

export const SONNER_SPEC: TunerSpec<SonnerValues, SonnerContext> = {
	component: "sonner",
	title: "Sonner",
	description: "仅调整通知留白与图文间距；修改参数会重新播放通知示例，不改变生产通知生命周期",
	storageKey: "valar.sonner-styles.v2",
	group: "通知布局",
	parameters: [
		{ kind: "number", key: "paddingX", label: "横向留白（标称 px）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "paddingY", label: "纵向留白（标称 px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "contentGap", label: "图文间距（标称 px）", min: 0, max: 16, step: 2 },
	],
	valuesSchema: sonnerValuesSchema,
	tokens: [
		["--spacing", "间距基数（仅已覆盖的留白与间距跟随）"],
		["--radius", "圆角基数（保持样式自带）"],
		["--popover", "普通通知背景"],
		["--popover-foreground", "普通通知文字"],
		["--border", "普通通知边框"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/sonner.json`];
		if (!load) throw new Error(`没有 ${style} 的 Sonner registry`);
		return parseSonnerSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		sonnerCss(`${scope} .cn-toast[data-sonner-toast][data-styled="true"]`, overrides),
	pageCss: (overrides) =>
		sonnerCss(
			'.cn-toast[data-sonner-toast][data-styled="true"]:not([data-component-tuner]):not([data-component-tuner] *)',
			overrides
		),
	overrideClasses: sonnerOverrideClasses,
};
