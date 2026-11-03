import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		paddingX: z.number().int().min(0).max(24).multipleOf(2),
		paddingY: z.number().int().min(0).max(16).multipleOf(2),
		gap: z.number().int().min(0).max(16).multipleOf(2),
		listHeight: z.number().int().min(160).max(384).multipleOf(16),
	})
	.strict();
export type CommandValues = z.infer<typeof valuesSchema>;
export type CommandOverrides = Partial<CommandValues>;
export type CommandContext = null;

export function parseCommandSource(files: { target: string; content: string }[]): {
	values: CommandValues;
	context: CommandContext;
} {
	const classes = (name: string) => {
		const source = files.find(
			(file) => file.target.split("/").at(-1) === `${name}.svelte`
		)?.content;
		const args = source && /class=\{cn\(([\s\S]*?)\)\}/.exec(source)?.[1];
		if (args === undefined) throw new Error(`Command registry 缺少 ${name}`);
		return cn(...[...args.matchAll(/"([^"\n]*)"/g)].map((match) => match[1]));
	};
	const item = classes("command-item"),
		link = classes("command-link-item"),
		list = classes("command-list");
	const pixels = (utility: string, words: string) => {
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, words);
		if (value === undefined) throw new Error(`Command registry 缺少 ${utility}`);
		return Number(value) * 4;
	};
	for (const utility of ["px", "py", "gap"])
		if (pixels(utility, item) !== pixels(utility, link))
			throw new Error("Command Item 与 LinkItem 几何不一致");
	return {
		values: valuesSchema.parse({
			paddingX: pixels("px", item),
			paddingY: pixels("py", item),
			gap: pixels("gap", item),
			listHeight: pixels("max-h", list),
		}),
		context: null,
	};
}

export function commandOverrideClasses(overrides: CommandOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides),
		item: string[] = [];
	if (safe.paddingX !== undefined) item.push(`px-${spacing(safe.paddingX)}`);
	if (safe.paddingY !== undefined) item.push(`py-${spacing(safe.paddingY)}`);
	if (safe.gap !== undefined) item.push(`gap-${spacing(safe.gap)}`);
	return {
		...(item.length ? { "cn-command-item": item.join(" ") } : {}),
		...(safe.listHeight !== undefined
			? { "cn-command-list": `max-h-${spacing(safe.listHeight)}` }
			: {}),
	};
}
function commandCss(select: (slot: string) => string, overrides: CommandOverrides): string {
	const safe = valuesSchema.partial().parse(overrides),
		item: string[] = [],
		rules: string[] = [];
	if (safe.paddingX !== undefined) item.push(`padding-inline: ${safe.paddingX}px;`);
	if (safe.paddingY !== undefined) item.push(`padding-block: ${safe.paddingY}px;`);
	if (safe.gap !== undefined) item.push(`gap: ${safe.gap}px;`);
	if (item.length) rules.push(`${select("command-item")} { ${item.join(" ")} }`);
	if (safe.listHeight !== undefined)
		rules.push(`${select("command-list")} { max-height: ${safe.listHeight}px; }`);
	return rules.join("\n");
}
const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/command.json",
	{ import: "default" }
);
export const COMMAND_SPEC: TunerSpec<CommandValues, CommandContext> = {
	component: "command",
	title: "Command",
	storageKey: "valar.command-styles.v2",
	description: "只调命令项留白／图文间距和结果列表高度上限；不改 Input Group、Dialog 或搜索逻辑",
	group: "结果列表几何",
	valuesSchema,
	parameters: [
		{ kind: "number", key: "paddingX", label: "命令项横向留白（px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "paddingY", label: "命令项纵向留白（px）", min: 0, max: 16, step: 2 },
		{ kind: "number", key: "gap", label: "命令项图文间距（px）", min: 0, max: 16, step: 2 },
		{
			kind: "number",
			key: "listHeight",
			label: "结果列表高度上限（px）",
			min: 160,
			max: 384,
			step: 16,
		},
	],
	tokens: [
		["--radius", "圆角基数（保留各场景自带档位）"],
		["--muted", "高亮结果"],
		["--foreground", "命令文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/command.json`];
		if (!load) throw new Error(`没有 ${style} 的 Command registry`);
		return parseCommandSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		commandCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) =>
		commandCss(
			(slot) => `[data-slot="${slot}"]:not([data-component-tuner]):not([data-component-tuner] *)`,
			overrides
		),
	overrideClasses: commandOverrideClasses,
};
