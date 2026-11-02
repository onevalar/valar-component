import { z } from "zod";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	radiusCss,
	spacing,
	STYLE_VALUE,
	type TunerSpec,
} from "./tuner.js";

export const AVATAR_SIZES = [
	{ id: "sm", label: "小" },
	{ id: "default", label: "默认" },
	{ id: "lg", label: "大" },
] as const;
export type AvatarSize = (typeof AVATAR_SIZES)[number]["id"];
export type AvatarSizeKey = `${AvatarSize}.size`;
const sizeSchema = z.number().int().min(20).max(64).multipleOf(4);
const valuesSchema = z
	.object({
		"sm.size": sizeSchema,
		"default.size": sizeSchema,
		"lg.size": sizeSchema,
		radius: z.enum(RADIUS_CHOICES),
	})
	.strict();
export type AvatarValues = z.infer<typeof valuesSchema>;
export type AvatarOverrides = Partial<AvatarValues>;
export type AvatarContext = null;

const rootPrefix = (size: AvatarSize) => (size === "default" ? "" : `data-[size=${size}]:`);
const countPrefix = (size: AvatarSize) =>
	size === "default" ? "" : `group-has-data-[size=${size}]/avatar-group:`;
const badgePrefix = (size: AvatarSize) => `group-data-[size=${size}]/avatar:`;

// These are invariants checked against every installed source, not style-name defaults.
// 8 + (size - 24)/4, 10 + (size - 32)/4 and 12 + (size - 40)/4 all equal this.
const badgeSize = (size: number) => size / 4 + 2;

/** Read all literal cn arguments in order: Badge's primitive utilities come AFTER cn-* expansion. */
export function parseAvatarSource(files: { target: string; content: string }[]): {
	values: AvatarValues;
	context: AvatarContext;
} {
	const words = (name: string) => {
		const file = files.find((file) => file.target.split("/").at(-1) === `${name}.svelte`);
		const args = /class=\{cn\(([\s\S]*?),\s*className\s*\)/.exec(file?.content ?? "")?.[1];
		if (args === undefined) throw new Error(`Avatar registry 缺少 ${name} 的 cn 样式`);
		return [...args.matchAll(/"([^"\n]*)"/g)].flatMap((match) => match[1].split(/\s+/));
	};
	const root = words("avatar");
	const count = words("avatar-group-count");
	const badge = words("avatar-badge");
	const image = words("avatar-image");
	const fallback = words("avatar-fallback");
	const read = (list: string[], prefix: string, utility: string) => {
		const start = `${prefix}${utility}-`;
		const matches = list.filter((word) => word.startsWith(start));
		// cn merges normal and important utilities separately; important wins regardless of order.
		const word = matches.findLast((word) => word.endsWith("!")) ?? matches.at(-1);
		if (!word) throw new Error(`Avatar registry 缺少 ${start}`);
		return word.slice(start.length).replace(/!$/, "");
	};
	const pixels = (list: string[], prefix: string) => {
		const value = read(list, prefix, "size");
		if (!/^\d+(?:\.(?:25|5|75))?$/.test(value))
			throw new Error(`Avatar registry 的 ${prefix}size 无法读取`);
		return Number(value) * 4;
	};
	const values = {} as AvatarValues;
	for (const { id } of AVATAR_SIZES) {
		const size = pixels(root, rootPrefix(id));
		values[`${id}.size`] = size;
		if (
			pixels(count, countPrefix(id)) !== size ||
			pixels(count, `${countPrefix(id)}[&>svg]:`) !== size / 2 ||
			pixels(badge, badgePrefix(id)) !== badgeSize(size)
		)
			throw new Error(`Avatar registry 的 ${id} 联动尺寸与合同不一致`);
	}
	if (
		!badge.includes(`${badgePrefix("sm")}[&>svg]:hidden`) ||
		pixels(badge, `${badgePrefix("default")}[&>svg]:`) !== 8 ||
		pixels(badge, `${badgePrefix("lg")}[&>svg]:`) !== 8 ||
		read(badge, "", "rounded") !== "full"
	)
		throw new Error("Avatar registry 的 Badge 图标或圆角与合同不一致");
	const radii = [
		read(root, "", "rounded"),
		read(root, "after:", "rounded"),
		read(image, "", "rounded"),
		read(fallback, "", "rounded"),
		read(count, "", "rounded"),
	];
	values.radius =
		new Set(radii).size === 1
			? (RADIUS_CHOICES.find((value) => value === radii[0]) ?? STYLE_VALUE)
			: STYLE_VALUE;
	return { values: valuesSchema.parse(values), context: null };
}

export function avatarOverrideClasses(overrides: AvatarOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string[]> = {};
	const add = (slot: string, ...utilities: string[]) => (classes[slot] ??= []).push(...utilities);
	for (const { id } of AVATAR_SIZES) {
		const size = safe[`${id}.size`];
		if (size === undefined) continue;
		add("cn-avatar", `${rootPrefix(id)}size-${spacing(size)}`);
		add(
			"cn-avatar-group-count",
			`${countPrefix(id)}size-${spacing(size)}`,
			`${countPrefix(id)}[&>svg]:size-${spacing(size / 2)}`
		);
		// cn-* is expanded before the primitive's size-2/2.5/3 arguments. Only important
		// can beat those later normal arguments without changing the primitive/API.
		add("cn-avatar-badge", `${badgePrefix(id)}size-${spacing(badgeSize(size))}!`);
	}
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		for (const slot of [
			"cn-avatar",
			"cn-avatar-image",
			"cn-avatar-fallback",
			"cn-avatar-group-count",
		])
			add(slot, `rounded-${safe.radius}`);
		add("cn-avatar", `after:rounded-${safe.radius}`);
	}
	return Object.fromEntries(Object.entries(classes).map(([slot, list]) => [slot, list.join(" ")]));
}

function avatarCss(select: (slot: string) => string, overrides: AvatarOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const dimensions = (selector: string, size: number) =>
		`${selector} { width: ${size}px; height: ${size}px; }`;
	for (const { id } of AVATAR_SIZES) {
		const size = safe[`${id}.size`];
		if (size === undefined) continue;
		const root = select("avatar");
		const sizedRoot = `${root}[data-size="${id}"]`;
		rules.push(dimensions(sizedRoot, size));
		// Mirror group-has conditions, not a GroupCount size prop. sm wins in mixed groups,
		// even when lg is numerically smaller after asymmetric tuning.
		const hasSmall = ':has([data-size="sm"])';
		const hasLarge = ':has([data-size="lg"])';
		const condition =
			id === "sm"
				? hasSmall
				: id === "lg"
					? `${hasLarge}:not(${hasSmall})`
					: `:not(${hasSmall}):not(${hasLarge})`;
		const count = `${select("avatar-group-count")}:is([data-slot="avatar-group"]${condition} *)`;
		rules.push(dimensions(count, size), dimensions(`${count} > svg`, size / 2));
		const badge = `${select("avatar-badge")}:is(${sizedRoot} *)`;
		// Layered important beats already-written important utilities too, just as Sheet does.
		rules.push(
			`@layer base { ${badge} { width: ${badgeSize(size)}px !important; height: ${badgeSize(size)}px !important; } }`
		);
	}
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		for (const slot of ["avatar", "avatar-image", "avatar-fallback", "avatar-group-count"])
			rules.push(`${select(slot)} { border-radius: ${radiusCss(safe.radius)}; }`);
		rules.push(`${select("avatar")}::after { border-radius: ${radiusCss(safe.radius)}; }`);
	}
	return rules.join("\n");
}

const registryAvatars = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/avatar.json",
	{ import: "default" }
);
const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export const AVATAR_SPEC: TunerSpec<AvatarValues, AvatarContext> = {
	component: "avatar",
	title: "Avatar",
	description: "联动三档头像、状态标记与头像组计数尺寸；保留字体、图标隐藏规则和组重叠",
	storageKey: "valar.avatar-styles.v2",
	group: "尺寸与圆角",
	parameters: [
		...AVATAR_SIZES.map(({ id, label }) => ({
			kind: "number" as const,
			key: `${id}.size`,
			label: `${label} · 尺寸（px）`,
			min: 20,
			max: 64,
			step: 4,
		})),
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: RADIUS_CHOICES.map((value) => ({
				value,
				label: value === STYLE_VALUE ? "样式自带" : RADIUS_LABELS[value],
			})),
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--text-xs", "小尺寸后备文字"],
		["--text-sm", "默认后备文字"],
		["--primary", "状态标记背景"],
		["--muted", "后备与计数背景"],
		["--border", "边框色"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryAvatars[`/src/__registry__/json/styles/${style.replace("style-", "")}/avatar.json`];
		if (!load) throw new Error(`没有 ${style} 的 Avatar registry`);
		return parseAvatarSource((await load()).files);
	},
	previewCss: (scope, overrides) =>
		avatarCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => avatarCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: avatarOverrideClasses,
};
