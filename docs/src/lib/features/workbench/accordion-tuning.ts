import { z } from "zod";
import { spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		triggerPaddingY: z.number().int().min(0).max(32).multipleOf(2),
		paddingX: z.number().int().min(0).max(32).multipleOf(2),
		contentPaddingBottom: z.number().int().min(0).max(40).multipleOf(2),
	})
	.strict();
export type AccordionValues = z.infer<typeof valuesSchema>;
export type AccordionOverrides = Partial<AccordionValues>;

/** Read only actual padding utilities, never paragraph or icon descendant selectors. */
function padding(classes: string, edge: "t" | "r" | "b" | "l"): number | undefined {
	const words = classes.split(/\s+/);
	let result: number | undefined;
	for (const utility of ["p", edge === "t" || edge === "b" ? "py" : "px", `p${edge}`]) {
		const word = words.find((word) => word.startsWith(`${utility}-`));
		if (!word) continue;
		const value = word.slice(utility.length + 1);
		if (!/^\d+(?:\.5)?$/.test(value))
			throw new Error(`Accordion registry 的 ${utility} 无法读取为间距`);
		result = Number(value) * 4;
	}
	return result;
}

/** Flattened installed sources keep the outer animated wrapper and inner padding separate. */
export function parseAccordionSource(files: { target: string; content: string }[]): {
	values: AccordionValues;
	context: null;
} {
	const source = (name: string) => {
		const file = files.find((file) => file.target.split("/").at(-1) === `${name}.svelte`);
		if (!file) throw new Error(`Accordion registry 缺少 ${name}`);
		return file.content;
	};
	const trigger = /cn\(\s*"([^"]*)"/.exec(source("accordion-trigger"))?.[1];
	const content = source("accordion-content");
	const outer = /data-slot="accordion-content"\s+class="([^"]*)"/.exec(content)?.[1];
	const inner = /cn\(\s*"([^"]*)"/.exec(content)?.[1];
	if (trigger === undefined || outer === undefined || inner === undefined)
		throw new Error("Accordion registry 缺少标题或内容样式");
	const paddingX = padding(trigger, "l") ?? 0;
	const triggerPaddingY = padding(trigger, "t");
	if (
		(padding(trigger, "r") ?? 0) !== paddingX ||
		(padding(outer, "l") ?? 0) !== paddingX ||
		(padding(outer, "r") ?? 0) !== paddingX ||
		padding(trigger, "b") !== triggerPaddingY ||
		padding(inner, "t") !== 0
	)
		throw new Error("Accordion registry 的标题／内容留白不符合共享参数合同");
	return {
		values: valuesSchema.parse({
			triggerPaddingY,
			paddingX,
			contentPaddingBottom: padding(inner, "b"),
		}),
		context: null,
	};
}

export function accordionOverrideClasses(overrides: AccordionOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const result: Record<string, string> = {};
	const trigger: string[] = [];
	if (safe.triggerPaddingY !== undefined) trigger.push(`py-${spacing(safe.triggerPaddingY)}`);
	if (safe.paddingX !== undefined) {
		const horizontal = `px-${spacing(safe.paddingX)}`;
		trigger.push(horizontal);
		result["cn-accordion-content"] = horizontal;
	}
	if (trigger.length) result["cn-accordion-trigger"] = trigger.join(" ");
	if (safe.contentPaddingBottom !== undefined)
		result["cn-accordion-content-inner"] = `pb-${spacing(safe.contentPaddingBottom)}`;
	return result;
}

function accordionCss(scope: string, overrides: AccordionOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const trigger = `${scope}[data-slot="accordion-trigger"]`;
	const content = `${scope}[data-slot="accordion-content"]`;
	const rules: string[] = [];
	if (safe.triggerPaddingY !== undefined)
		rules.push(`${trigger} { padding-block: ${safe.triggerPaddingY}px; }`);
	if (safe.paddingX !== undefined)
		rules.push(`${trigger}, ${content} { padding-inline: ${safe.paddingX}px; }`);
	if (safe.contentPaddingBottom !== undefined)
		rules.push(`${content} > div { padding-bottom: ${safe.contentPaddingBottom}px; }`);
	return rules.join("\n");
}

const registryAccordions = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/accordion.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const ACCORDION_SPEC: TunerSpec<AccordionValues, null> = {
	component: "accordion",
	title: "Accordion",
	description: "只调整标题纵向、标题与内容共同横向、内容底部留白；保留展开规则、动效与内嵌控件",
	storageKey: "valar.accordion-styles.v2",
	group: "标题与内容留白",
	parameters: [
		{
			kind: "number",
			key: "triggerPaddingY",
			label: "标题纵向留白（px）",
			min: 0,
			max: 32,
			step: 2,
		},
		{
			kind: "number",
			key: "paddingX",
			label: "标题／内容横向留白（px）",
			min: 0,
			max: 32,
			step: 2,
		},
		{
			kind: "number",
			key: "contentPaddingBottom",
			label: "内容底部留白（px）",
			min: 0,
			max: 40,
			step: 2,
		},
	],
	valuesSchema,
	tokens: [
		["--text-xs", "小号字"],
		["--text-sm", "正文字号"],
		["--foreground", "文字色"],
		["--muted-foreground", "次要文字与图标"],
		["--border", "边框色"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryAccordions[
				`/src/__registry__/json/styles/${style.replace("style-", "")}/accordion.json`
			];
		if (!load) throw new Error(`没有 ${style} 的 Accordion registry`);
		return parseAccordionSource((await load()).files);
	},
	previewCss: (scope, overrides) => accordionCss(`${scope} `, overrides),
	pageCss: (overrides) => accordionCss(NOT_EDITOR, overrides),
	overrideClasses: accordionOverrideClasses,
};
