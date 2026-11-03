import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const padding = z.number().int().min(8).max(32).multipleOf(2);
const valuesSchema = z.object({ paddingX: padding, smPaddingX: padding }).strict();
export type CodeBlockValues = z.infer<typeof valuesSchema>;
export type CodeBlockOverrides = Partial<CodeBlockValues>;
export type CodeBlockContext = null;
const SM = "group-data-[size=sm]/code-block:";

export function parseCodeBlockSource(files: { target: string; content: string }[]): {
	values: CodeBlockValues;
	context: CodeBlockContext;
} {
	const classes = (part: string) => {
		const source =
			files.find((file) => file.target.split("/").at(-1) === `code-block-${part}.svelte`)
				?.content ?? "";
		const literal =
			part === "line"
				? /base:\s*"([^"]*)"/.exec(source)?.[1]
				: /class=\{cn\(([\s\S]*?)\)\}/.exec(source)?.[1];
		if (literal === undefined) throw new Error(`Code Block registry 缺少 ${part} 样式`);
		return part === "line"
			? cn(literal)
			: cn(...[...literal.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
	};
	const parts = ["header", "footer", "content", "line"].map(classes);
	const read = (small: boolean) => {
		const words = parts.map((part) =>
			small
				? part
						.split(/\s+/)
						.filter((word) => word.startsWith(SM))
						.map((word) => word.slice(SM.length))
						.join(" ")
				: part
		);
		const values = words.map((part) => sourceWord("px-(\\d+(?:\\.5)?)", part));
		const margin = sourceWord("-mx-(\\d+(?:\\.5)?)", words[3]);
		if (values.some((value) => value === undefined || value !== values[0]) || margin !== values[0])
			throw new Error("Code Block registry 的横向留白与行负边距不一致");
		return Number(values[0]) * 4;
	};
	return {
		values: valuesSchema.parse({ paddingX: read(false), smPaddingX: read(true) }),
		context: null,
	};
}

export function codeBlockOverrideClasses(overrides: CodeBlockOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const padding: string[] = [],
		margin: string[] = [];
	for (const [key, prefix] of [
		["paddingX", ""],
		["smPaddingX", SM],
	] as const) {
		if (safe[key] === undefined) continue;
		padding.push(`${prefix}px-${spacing(safe[key])}`);
		margin.push(`${prefix}-mx-${spacing(safe[key])}`);
	}
	if (!padding.length) return {};
	return {
		"cn-code-block-header": padding.join(" "),
		"cn-code-block-footer": padding.join(" "),
		"cn-code-block-content": padding.join(" "),
		"cn-code-block-line": [...padding, ...margin].join(" "),
	};
}

function codeBlockCss(
	select: (size: string, slot: string) => string,
	overrides: CodeBlockOverrides
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	for (const [key, size] of [
		["paddingX", "default"],
		["smPaddingX", "sm"],
	] as const) {
		if (safe[key] === undefined) continue;
		for (const slot of ["header", "footer", "content", "line"])
			rules.push(
				`${select(size, slot)} { padding-inline: ${safe[key]}px;${slot === "line" ? ` margin-inline: -${safe[key]}px;` : ""} }`
			);
	}
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/code-block.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
function selector(scope: string, size: string, slot: string, exclusion = "") {
	const root = `${scope}[data-slot="code-block"][data-size="${size}"]${exclusion}`;
	return slot === "line"
		? `${root} > [data-slot="code-block-content"] > [data-slot="code-block-code"] > [data-slot="code-block-line"]${exclusion}`
		: `${root} > [data-slot="code-block-${slot}"]${exclusion}`;
}
export const CODE_BLOCK_SPEC: TunerSpec<CodeBlockValues, CodeBlockContext> = {
	component: "code-block",
	title: "Code Block",
	description:
		"仅联动两尺寸标题、页脚、内容与代码行的横向留白；保留纵向层次与真实复制、高亮和流式输出",
	storageKey: "valar.code-block-styles.v2",
	group: "横向留白",
	parameters: [
		{ kind: "number", key: "paddingX", label: "默认横向留白（px）", min: 8, max: 32, step: 2 },
		{ kind: "number", key: "smPaddingX", label: "小尺寸横向留白（px）", min: 8, max: 32, step: 2 },
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数（只读）"],
		["--muted", "代码背景"],
		["--muted-foreground", "次要文字"],
		["--border", "边框"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/code-block.json`];
		if (!load) throw new Error(`没有 ${style} 的 Code Block registry`);
		return parseCodeBlockSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		codeBlockCss((size, slot) => selector(`${scope} `, size, slot), overrides),
	pageCss: (overrides) =>
		codeBlockCss((size, slot) => selector("", size, slot, NOT_EDITOR), overrides),
	overrideClasses: codeBlockOverrideClasses,
};
