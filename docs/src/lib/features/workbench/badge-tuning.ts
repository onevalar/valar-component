import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

const valuesSchema = z
	.object({
		paddingX: z.number().int().min(0).max(24).multipleOf(2),
		gap: z.number().int().min(0).max(16).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type BadgeValues = z.infer<typeof valuesSchema>;
export type BadgeOverrides = Partial<BadgeValues>;

/** Read the flattened base only; variants, typography and icon-side padding stay intact. */
export function parseBadgeSource(files: { target: string; content: string }[]): {
	values: BadgeValues;
	context: null;
} {
	const file = files.find((file) => file.target.split("/").at(-1) === "badge.svelte")?.content;
	const classes = /badgeVariants\s*=\s*tv\(\{\s*base:\s*"([^"]*)"/.exec(file ?? "")?.[1];
	if (classes === undefined) throw new Error("Badge registry 缺少基础样式");
	const words = classes.split(/\s+/);
	const read = (utility: string) => {
		const value = words.find((word) => word.startsWith(`${utility}-`))?.slice(utility.length + 1);
		if (value === undefined) throw new Error(`Badge registry 缺少 ${utility} 基础样式`);
		return value;
	};
	const pixels = (utility: string) => {
		const value = read(utility);
		if (!/^\d+(?:\.(?:25|5|75))?$/.test(value))
			throw new Error(`Badge registry 的 ${utility} 无法读取为间距`);
		return Number(value) * 4;
	};
	const radius = read("rounded");
	return {
		values: valuesSchema.parse({
			paddingX: pixels("px"),
			gap: pixels("gap"),
			radius: RADIUS_CHOICES.find((value) => value === radius) ?? STYLE_VALUE,
		}),
		context: null,
	};
}

export function badgeOverrideClasses(overrides: BadgeOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	// The more-specific has-data-icon pl/pr utilities deliberately keep the icon side tighter.
	if (safe.paddingX !== undefined) classes.push(`px-${spacing(safe.paddingX)}`);
	if (safe.gap !== undefined) classes.push(`gap-${spacing(safe.gap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		classes.push(`rounded-${safe.radius}`);
	return classes.length ? { "cn-badge": classes.join(" ") } : {};
}

function badgeCss(select: string, overrides: BadgeOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	if (safe.paddingX !== undefined) {
		// Mirror px-N without overriding either style's more-specific icon-side padding.
		rules.push(
			`${select}:not(:has([data-icon="inline-start"])) { padding-left: ${safe.paddingX}px; }`,
			`${select}:not(:has([data-icon="inline-end"])) { padding-right: ${safe.paddingX}px; }`
		);
	}
	if (safe.gap !== undefined) rules.push(`${select} { gap: ${safe.gap}px; }`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		rules.push(`${select} { border-radius: ${radiusCss(safe.radius)}; }`);
	return rules.join("\n");
}

const registryBadges = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/badge.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const BADGE_SPEC: TunerSpec<BadgeValues, null> = {
	component: "badge",
	title: "Badge",
	description: "只调整文字侧留白、图文间距与圆角，保留样式自带的高度、图标侧留白和字体",
	storageKey: "valar.badge-styles.v2",
	group: "留白与圆角",
	parameters: [
		{ kind: "number", key: "paddingX", label: "文字侧水平留白（px）", min: 0, max: 24, step: 2 },
		{ kind: "number", key: "gap", label: "图文间距（px）", min: 0, max: 16, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--text-xs", "特小号字"],
		["--primary", "主色"],
		["--secondary", "次要色"],
		["--destructive", "危险色"],
		["--foreground", "文字色"],
		["--border", "边框色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryBadges[`/src/__registry__/json/styles/${style.replace("style-", "")}/badge.json`];
		if (!load) throw new Error(`没有 ${style} 的 Badge registry`);
		return parseBadgeSource((await load()).files);
	},
	previewCss: (scope, overrides) => badgeCss(`${scope} [data-slot="badge"]`, overrides),
	pageCss: (overrides) => badgeCss(`[data-slot="badge"]${NOT_EDITOR}`, overrides),
	overrideClasses: (overrides) => badgeOverrideClasses(overrides),
};
