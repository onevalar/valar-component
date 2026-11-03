import { cn } from "cn";
import { z } from "zod";
import { spacing, type TunerSpec } from "./tuner.js";

const space = z.number().int().min(0).max(48).multipleOf(2);
const valuesSchema = z.object({ gap: space, paddingX: space, paddingY: space }).strict();
export type MessageScrollerValues = z.infer<typeof valuesSchema>;
export type MessageScrollerOverrides = Partial<MessageScrollerValues>;
export type MessageScrollerContext = null;

export function parseMessageScrollerSource(files: { target: string; content: string }[]): {
	values: MessageScrollerValues;
	context: MessageScrollerContext;
} {
	const source = files.find(
		(file) => file.target.split("/").at(-1) === "message-scroller-content.svelte"
	)?.content;
	if (!source) throw new Error("Message Scroller registry 缺少 Content 源码");
	const args =
		/data-slot="message-scroller-content"[\s\S]*?class=\{cn\(((?:"[^"]*"|[^)"])*)\)/.exec(
			source
		)?.[1];
	if (args === undefined) throw new Error("Message Scroller registry 缺少 Content 样式");
	// Flattening may place utilities in several cn() literals. Merge ALL of them in order.
	const classes = cn(...[...args.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	const read = (utility: RegExp, required: boolean) => {
		const words = classes.split(/\s+/).filter((word) => utility.test(word));
		const word = words.at(-1);
		// Content has no padding utilities in the original eight styles: CSS initial padding is 0.
		// This is only valid after finding the real Content class expression, never for missing source.
		if (word === undefined && !required) return 0;
		const value = word?.match(/^(?:gap|p|px|py)-(\d+(?:\.5)?)$/)?.[1];
		if (value === undefined)
			throw new Error("Message Scroller registry 留白不是有限 spacing 工具类");
		return Number(value) * 4;
	};
	return {
		values: valuesSchema.parse({
			gap: read(/^gap-/, true),
			paddingX: read(/^(?:p|px)-/, false),
			paddingY: read(/^(?:p|py)-/, false),
		}),
		context: null,
	};
}

export function messageScrollerOverrideClasses(
	overrides: MessageScrollerOverrides
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const words: string[] = [];
	if (safe.gap !== undefined) words.push(`gap-${spacing(safe.gap)}`);
	if (safe.paddingX !== undefined) words.push(`px-${spacing(safe.paddingX)}`);
	if (safe.paddingY !== undefined) words.push(`py-${spacing(safe.paddingY)}`);
	return words.length ? { "cn-message-scroller-content": words.join(" ") } : {};
}

function messageScrollerCss(selector: string, overrides: MessageScrollerOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const declarations: string[] = [];
	const scaled = (value: number) => `calc(var(--spacing) * ${spacing(value)})`;
	if (safe.gap !== undefined) declarations.push(`gap: ${scaled(safe.gap)};`);
	if (safe.paddingX !== undefined) declarations.push(`padding-inline: ${scaled(safe.paddingX)};`);
	if (safe.paddingY !== undefined) declarations.push(`padding-block: ${scaled(safe.paddingY)};`);
	return declarations.length ? `${selector} { ${declarations.join(" ")} }` : "";
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/message-scroller.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const MESSAGE_SCROLLER_SPEC: TunerSpec<MessageScrollerValues, MessageScrollerContext> = {
	component: "message-scroller",
	title: "Message Scroller",
	storageKey: "valar.message-scroller-styles.v2",
	group: "滚动内容间距",
	description: "只调整 Content 间距与留白；保留视口、跟随、回合锚定与子消息尺寸",
	parameters: [
		{ kind: "number", key: "gap", label: "消息间距（基准 px）", min: 0, max: 48, step: 2 },
		{ kind: "number", key: "paddingX", label: "内容横向留白（基准 px）", min: 0, max: 48, step: 2 },
		{ kind: "number", key: "paddingY", label: "内容纵向留白（基准 px）", min: 0, max: 48, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--spacing", "全局间距基数（只读）"],
		["--text-sm", "全局文字尺寸（只读）"],
		["--foreground", "正文颜色（只读）"],
		["--muted-foreground", "辅助文字（只读）"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/message-scroller.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Message Scroller registry`);
		return parseMessageScrollerSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		messageScrollerCss(`${scope} [data-slot="message-scroller-content"]`, overrides),
	pageCss: (overrides) =>
		messageScrollerCss(`[data-slot="message-scroller-content"]${NOT_EDITOR}`, overrides),
	overrideClasses: messageScrollerOverrideClasses,
};
