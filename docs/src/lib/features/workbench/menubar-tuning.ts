import {
	createMenuSpec,
	parseMenuSource,
	type MenuContext,
	type MenuValues,
} from "./menu-tuning.js";

const GEOMETRY = [
	"padding",
	"minWidth",
	"radius",
	"itemPaddingX",
	"itemPaddingY",
	"itemGap",
	"itemRadius",
] as const;
export type MenubarValues = Pick<MenuValues, (typeof GEOMETRY)[number]>;
export type MenubarOverrides = Partial<MenubarValues>;
export type MenubarContext = MenuContext;

// Root height and trigger geometry stay style-owned: increasing their padding under an
// upstream fixed root height would clip content. Menu geometry reuses the existing contract.
export const MENUBAR_SPEC = createMenuSpec(
	"menubar",
	"Menubar",
	"调整菜单面板与菜单项的留白、圆角；保留菜单栏几何、方向键与悬停切换",
	GEOMETRY
);

export function parseMenubarSource(files: { target: string; content: string }[]): {
	values: MenubarValues;
	context: MenubarContext;
} {
	const result = parseMenuSource("menubar", files);
	return {
		values: MENUBAR_SPEC.valuesSchema.parse(
			Object.fromEntries(GEOMETRY.map((key) => [key, result.values[key]]))
		),
		context: result.context,
	};
}

export function menubarOverrideClasses(
	overrides: MenubarOverrides,
	context: MenubarContext
): Record<string, string> {
	return MENUBAR_SPEC.overrideClasses(overrides, context);
}
