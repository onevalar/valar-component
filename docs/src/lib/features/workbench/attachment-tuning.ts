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

const padding = z.number().int().min(0).max(16).multipleOf(2);
const valuesSchema = z
	.object({
		defaultPadding: padding,
		smPadding: padding,
		xsPadding: padding,
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type AttachmentValues = z.infer<typeof valuesSchema>;
export type AttachmentOverrides = Partial<AttachmentValues>;
export type AttachmentContext = null;
const SIZES = ["default", "sm", "xs"] as const;
const CONTENT = "has-data-[slot=attachment-content]:";
const MEDIA = "has-data-[slot=attachment-media]:";

export function parseAttachmentSource(files: { target: string; content: string }[]): {
	values: AttachmentValues;
	context: AttachmentContext;
} {
	const source =
		files.find((file) => file.target.split("/").at(-1) === "attachment.svelte")?.content ?? "";
	const base = /base:\s*"([^"]*)"/.exec(source)?.[1];
	if (base === undefined) throw new Error("Attachment registry 缺少根样式");
	const values: Record<string, string | number> = {};
	const radii: string[] = [];
	for (const size of SIZES) {
		const literal = new RegExp(`${size}:\\s*"([^"]*)"`).exec(source)?.[1];
		if (literal === undefined) throw new Error(`Attachment registry 缺少 ${size} 样式`);
		const classes = cn(base, literal);
		const read = (prefix: string) => {
			const word = classes.split(/\s+/).find((word) => word.startsWith(prefix));
			const value = word?.slice(prefix.length);
			if (!value || !/^\d+(?:\.5)?$/.test(value))
				throw new Error(`Attachment registry 缺少 ${prefix} 留白`);
			return Number(value) * 4;
		};
		const media = read(`${MEDIA}p-`);
		if (read(`${CONTENT}py-`) !== media || read(`${CONTENT}px-`) !== media + 2)
			throw new Error("Attachment registry 的条件留白不匹配：内容横向应比媒体留白多 2px");
		values[`${size}Padding`] = media;
		radii.push(sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, classes) ?? STYLE_VALUE);
	}
	values.radius = radii.every((radius) => radius === radii[0]) ? radii[0] : STYLE_VALUE;
	return { values: valuesSchema.parse(values), context: null };
}

export function attachmentOverrideClasses(overrides: AttachmentOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string> = {};
	for (const size of SIZES) {
		const words: string[] = [];
		const value = safe[`${size}Padding`];
		if (value !== undefined)
			words.push(
				`${CONTENT}px-${spacing(value + 2)}`,
				`${CONTENT}py-${spacing(value)}`,
				`${MEDIA}p-${spacing(value)}`
			);
		if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
			words.push(`rounded-${safe.radius}`);
		if (words.length) classes[`cn-attachment-size-${size}`] = words.join(" ");
	}
	return classes;
}

function attachmentCss(select: (slot: string) => string, overrides: AttachmentOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	for (const size of SIZES) {
		const root = `${select("attachment")}[data-size="${size}"]`;
		const value = safe[`${size}Padding`];
		if (value !== undefined) {
			rules.push(
				`${root}:has([data-slot="attachment-content"]) { padding-inline: ${value + 2}px; padding-block: ${value}px; }`
			);
			// The existing Media p-* wins over Content px/py when BOTH are present.
			rules.push(`${root}:has([data-slot="attachment-media"]) { padding: ${value}px; }`);
		}
		if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
			rules.push(`${root} { border-radius: ${radiusCss(safe.radius)}; }`);
	}
	return rules.join("\n");
}

const registries = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/attachment.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";
export const ATTACHMENT_SPEC: TunerSpec<AttachmentValues, AttachmentContext> = {
	component: "attachment",
	title: "Attachment",
	storageKey: "valar.attachment-styles.v2",
	group: "附件密度",
	description: "按三种尺寸调整条件留白与外框圆角；保留媒体尺寸、横纵布局、状态与操作",
	parameters: [
		...SIZES.map((size) => ({
			kind: "number" as const,
			key: `${size}Padding`,
			label: `${size} 留白（px，纯文字横向 +2）`,
			min: 0,
			max: 16,
			step: 2,
		})),
		{
			kind: "select",
			key: "radius",
			label: "三尺寸外框圆角",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--card", "附件表面"],
		["--destructive", "失败状态色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registries[`/src/__registry__/json/styles/${style.replace("style-", "")}/attachment.json`];
		if (!load) throw new Error(`没有 ${style} 的 Attachment registry`);
		return parseAttachmentSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		attachmentCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => attachmentCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: attachmentOverrideClasses,
};
