import { cn } from "cn";
import { z } from "zod";
import { sourceWord, spacing, type TunerSpec } from "./tuner.js";

const valuesSchema = z
	.object({
		gap: z.number().int().min(0).max(32).multipleOf(2),
		triggerPadding: z.number().int().min(8).max(24).multipleOf(2),
	})
	.strict();
export type StepperValues = z.infer<typeof valuesSchema>;
export type StepperOverrides = Partial<StepperValues>;
export type StepperContext = null;

export function parseStepperSource(files: { target: string; content: string }[]): {
	values: StepperValues;
	context: StepperContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "stepper.svelte")?.content ?? "";
	const read = (slot: string, utility: string) => {
		const literal = new RegExp(
			`data-slot="${slot}"[\\s\\S]*?class=(?:\\{cn\\(([\\s\\S]*?)\\)\\}|"([^"]*)")`
		).exec(source);
		if (!literal) throw new Error(`Stepper registry 缺少 ${slot} 样式`);
		const classes =
			literal[1] !== undefined
				? cn(...[...literal[1].matchAll(/"([^"]*)"/g)].map((match) => match[1]))
				: cn(literal[2]);
		const value = sourceWord(`${utility}-(\\d+(?:\\.5)?)`, classes);
		if (value === undefined) throw new Error(`Stepper registry 缺少 ${slot} 的 ${utility}`);
		return Number(value) * 4;
	};
	return {
		values: valuesSchema.parse({
			gap: read("stepper", "gap"),
			triggerPadding: read("stepper-trigger", "p"),
		}),
		context: null,
	};
}

export function stepperOverrideClasses(overrides: StepperOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	return {
		...(safe.gap !== undefined ? { "cn-stepper": `gap-${spacing(safe.gap)}` } : {}),
		...(safe.triggerPadding !== undefined
			? { "cn-stepper-trigger": `p-${spacing(safe.triggerPadding)}` }
			: {}),
	};
}
function stepperCss(select: (slot: string) => string, overrides: StepperOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.gap !== undefined) rules.push(`${select("stepper")} { gap: ${safe.gap}px; }`);
	if (safe.triggerPadding !== undefined)
		rules.push(`${select("stepper-trigger")} { padding: ${safe.triggerPadding}px; }`);
	return rules.join("\n");
}
const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/stepper.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const STEPPER_SPEC: TunerSpec<StepperValues, StepperContext> = {
	component: "stepper",
	title: "Stepper",
	description: "仅调整根布局间距与步骤按钮留白；保留校验门禁、取消、焦点和所有面板的挂载状态",
	storageKey: "valar.stepper-styles.v2",
	group: "流程几何",
	parameters: [
		{ kind: "number", key: "gap", label: "根布局间距（px）", min: 0, max: 32, step: 2 },
		{
			kind: "number",
			key: "triggerPadding",
			label: "步骤按钮留白（px）",
			min: 8,
			max: 24,
			step: 2,
		},
	],
	valuesSchema,
	tokens: [
		["--primary", "当前步骤"],
		["--destructive", "错误状态"],
		["--border", "边框"],
		["--ring", "焦点环"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/stepper.json`];
		if (!load) throw new Error(`没有 ${style} 的 Stepper registry`);
		return parseStepperSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		stepperCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => stepperCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: stepperOverrideClasses,
};
