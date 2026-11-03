import { cn } from "cn";
import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	sourceWord,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		height: z.number().int().min(2).max(16).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type ProgressValues = z.infer<typeof valuesSchema>;
export type ProgressOverrides = Partial<ProgressValues>;
export type ProgressContext = null;

export function parseProgressSource(files: { target: string; content: string }[]): {
	values: ProgressValues;
	context: ProgressContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "progress.svelte")?.content ?? "";
	const root = /data-slot="progress"[\s\S]*?class=\{cn\(([\s\S]*?)\)\}/.exec(source)?.[1];
	if (root === undefined || !source.includes('data-slot="progress-indicator"'))
		throw new Error("Progress registry 缺少轨道或指示器");
	const classes = cn(...[...root.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	const height = sourceWord("h-(\\d+(?:\\.5)?)", classes);
	if (height === undefined) throw new Error("Progress registry 缺少轨道高度");
	return {
		values: valuesSchema.parse({
			height: Number(height) * 4,
			radius: sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, classes) ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function progressOverrideClasses(overrides: ProgressOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const root: string[] = [];
	const indicator: string[] = [];
	if (safe.height !== undefined) root.push(`h-${spacing(safe.height)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		root.push(`rounded-${safe.radius}`);
		indicator.push(`rounded-${safe.radius}`);
	}
	return {
		...(root.length ? { "cn-progress": root.join(" ") } : {}),
		...(indicator.length ? { "cn-progress-indicator": indicator.join(" ") } : {}),
	};
}

function progressCss(select: (slot: string) => string, overrides: ProgressOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.height !== undefined) rules.push(`${select("progress")} { height: ${safe.height}px; }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		for (const slot of ["progress", "progress-indicator"])
			rules.push(`${select(slot)} { border-radius: ${radiusCss(safe.radius)}; }`);
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/progress.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const PROGRESS_SPEC: TunerSpec<ProgressValues, ProgressContext> = {
	component: "progress",
	title: "Progress",
	description: "只调整轨道高度与联动圆角；进度、总量和不确定状态由调用处决定",
	storageKey: "valar.progress-styles.v2",
	group: "轨道几何",
	parameters: [
		{ kind: "number", key: "height", label: "轨道高度（px）", min: 2, max: 16, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "轨道与指示器圆角",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--primary", "进度色"],
		["--muted", "轨道色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/progress.json`];
		if (!load) throw new Error(`没有 ${style} 的 Progress registry`);
		return parseProgressSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		progressCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => progressCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: progressOverrideClasses,
};
