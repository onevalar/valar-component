import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const even = (max: number) => z.number().int().min(0).max(max).multipleOf(2);
const valuesSchema = z
	.object({
		rootGap: even(32),
		choicesGap: even(24),
		actionsGap: even(16),
		choicePaddingX: even(24),
		choicePaddingY: even(24),
	})
	.strict();
export type QuestionnaireValues = z.infer<typeof valuesSchema>;
export type QuestionnaireOverrides = Partial<QuestionnaireValues>;
export type QuestionnaireContext = null;

const FIELDS = {
	rootGap: ["questionnaire", "gap", "gap"],
	choicesGap: ["questionnaire-choices", "gap", "gap"],
	actionsGap: ["questionnaire-actions", "gap", "gap"],
	choicePaddingX: ["questionnaire-choice", "px", "padding-inline"],
	choicePaddingY: ["questionnaire-choice", "py", "padding-block"],
} as const;
const KEYS = Object.keys(FIELDS) as (keyof QuestionnaireValues)[];

export function parseQuestionnaireSource(files: { target: string; content: string }[]): {
	values: QuestionnaireValues;
	context: QuestionnaireContext;
} {
	const values: Partial<QuestionnaireValues> = {};
	for (const key of KEYS) {
		const [slot, utility] = FIELDS[key];
		const source =
			files.find((file) => file.target.split("/").at(-1) === `${slot}.svelte`)?.content ?? "";
		const args = new RegExp(
			`data-slot="${slot}"[\\s\\S]*?class=\\{cn\\(((?:"[^"]*"|[^)"])*)\\)`
		).exec(source)?.[1];
		if (args === undefined) throw new Error(`Questionnaire registry 缺少 ${slot} 样式`);
		// Merge every static cn argument: later injected geometry must win over earlier literals.
		const classes = cn(...[...args.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, classes);
		if (value === undefined) throw new Error(`Questionnaire registry 缺少 ${slot} 的 ${utility}`);
		values[key] = Number(value) * 4;
	}
	return { values: valuesSchema.parse(values), context: null };
}

export function questionnaireOverrideClasses(
	overrides: QuestionnaireOverrides
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string> = {};
	for (const key of KEYS) {
		if (safe[key] === undefined) continue;
		const [slot, utility] = FIELDS[key];
		const name = `cn-${slot}`;
		classes[name] = cn(classes[name], `${utility}-${spacing(safe[key])}`);
	}
	return classes;
}

function questionnaireCss(
	select: (slot: string) => string,
	overrides: QuestionnaireOverrides
): string {
	const safe = valuesSchema.partial().parse(overrides);
	return KEYS.flatMap((key) => {
		if (safe[key] === undefined) return [];
		const [slot, , property] = FIELDS[key];
		return [`${select(slot)} { ${property}: calc(var(--spacing) * ${spacing(safe[key])}); }`];
	}).join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/questionnaire.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const QUESTIONNAIRE_SPEC: TunerSpec<QuestionnaireValues, QuestionnaireContext> = {
	component: "questionnaire",
	title: "Questionnaire",
	storageKey: "valar.questionnaire-styles.v2",
	group: "问卷布局",
	description: "只调根、选项组、操作区间距与选项留白；保留真实问卷流程和移动触控下限",
	parameters: [
		{ kind: "number", key: "rootGap", label: "问卷分区间距（px）", min: 0, max: 32, step: 2 },
		{ kind: "number", key: "choicesGap", label: "选项组间距（px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "actionsGap", label: "导航操作间距（px）", min: 0, max: 16, step: 2 },
		{
			kind: "number",
			key: "choicePaddingX",
			label: "选项横向留白（px）",
			min: 0,
			max: 24,
			step: 2,
		},
		{
			kind: "number",
			key: "choicePaddingY",
			label: "选项纵向留白（px）",
			min: 0,
			max: 24,
			step: 2,
		},
	],
	valuesSchema,
	tokens: [
		["--primary", "选中状态"],
		["--destructive", "校验错误"],
		["--border", "边框"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/questionnaire.json`];
		if (!load) throw new Error(`没有 ${style} 的 Questionnaire registry`);
		return parseQuestionnaireSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		questionnaireCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) =>
		questionnaireCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: questionnaireOverrideClasses,
};
