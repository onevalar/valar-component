import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const gap = z.number().int().min(0).max(32).multipleOf(2);
const valuesSchema = z.object({ rowGap: gap, bodyGap: gap, groupGap: gap }).strict();
export type MessageValues = z.infer<typeof valuesSchema>;
export type MessageOverrides = Partial<MessageValues>;
export type MessageContext = null;
const SLOTS = { rowGap: "message", bodyGap: "message-content", groupGap: "message-group" } as const;

export function parseMessageSource(files: { target: string; content: string }[]): {
	values: MessageValues;
	context: MessageContext;
} {
	const values: Record<string, number> = {};
	for (const [key, slot] of Object.entries(SLOTS)) {
		const source =
			files.find((file) => file.target.split("/").at(-1) === `${slot}.svelte`)?.content ?? "";
		const args = /class=\{cn\(((?:"[^"]*"|[^)"])*)\)/.exec(source)?.[1];
		if (args === undefined) throw new Error(`Message registry 缺少 ${slot} 样式`);
		const classes = cn(...[...args.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
		const value = sourceWord("gap-(\\d+(?:\\.5)?)", classes);
		if (value === undefined) throw new Error(`Message registry 缺少 ${slot} 间距`);
		values[key] = Number(value) * 4;
	}
	return { values: valuesSchema.parse(values), context: null };
}

export function messageOverrideClasses(overrides: MessageOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return Object.fromEntries(
		(Object.keys(SLOTS) as (keyof typeof SLOTS)[]).flatMap((key) =>
			safe[key] === undefined ? [] : [[`cn-${SLOTS[key]}`, `gap-${spacing(safe[key])}`]]
		)
	);
}

function messageCss(select: (slot: string) => string, overrides: MessageOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	return (Object.keys(SLOTS) as (keyof typeof SLOTS)[])
		.flatMap((key) =>
			safe[key] === undefined ? [] : [`${select(SLOTS[key])} { gap: ${safe[key]}px; }`]
		)
		.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/message.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const MESSAGE_SPEC: TunerSpec<MessageValues, MessageContext> = {
	component: "message",
	title: "Message",
	storageKey: "valar.message-styles.v2",
	group: "消息布局",
	description: "只调消息行、正文列与连续消息组间距；不改头像、气泡及 ghost 页眉页脚留白",
	parameters: [
		{ kind: "number", key: "rowGap", label: "头像与正文间距（px）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "bodyGap", label: "正文分区间距（px）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "groupGap", label: "连续消息间距（px）", min: 0, max: 32, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--muted-foreground", "元信息文字"],
		["--foreground", "正文文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/message.json`];
		if (!load) throw new Error(`没有 ${style} 的 Message registry`);
		return parseMessageSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		messageCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => messageCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: messageOverrideClasses,
};
