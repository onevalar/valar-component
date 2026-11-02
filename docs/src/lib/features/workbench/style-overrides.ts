import { mergeClasses, parseStyleCss } from "@valar/svelte-parity/inject-style-classes";
import { z } from "zod";

/**
 * Component-level write-back into `src/lib/registry/styles/valar/style-<style>.css`.
 * Each component editor may write only its own `cn-*` classes, and each class only the kinds
 * of utilities its parameters produce (sizes, spacing, radius level, motion tier, …). Colors,
 * free-form values and other components are rejected; global tokens (colors, `--radius`, type
 * scale, motion values) belong to the `/themes` page.
 */
const N = String.raw`\d+(?:\.(?:25|5|75))?`;
const RADIUS = "(?:none|sm|md|lg|xl|2xl|3xl|4xl|full)";
const TIER = "(?:fast|normal|slow)";
const BUTTON_UTILITY = new RegExp(`^(?:(?:h|size|px|gap)-${N}|rounded-${RADIUS})$`);
const DIALOG_CONTENT_UTILITY = new RegExp(
	`^(?:(?:p|gap)-${N}|rounded-${RADIUS}|sm:max-w-(?:sm|md|lg|xl|2xl)|duration-${TIER}|data-open:zoom-in-(?:90|95|100)|data-closed:zoom-out-(?:90|95|100))$`
);
const DIALOG_OVERLAY_UTILITY = new RegExp(
	`^(?:bg-black/(?:0|10|20|30|40|50|60|70|80)|duration-${TIER})$`
);
const DIALOG_FOOTER_UTILITY = new RegExp(`^(?:-m[xb]-${N}|p-${N}|rounded-b-${RADIUS})$`);
const SIDE = "(?:top|bottom|left|right)";
const POPOVER_CONTENT_UTILITY = new RegExp(
	`^(?:(?:p|gap)-${N}|rounded-${RADIUS}|duration-${TIER}|data-open:zoom-in-(?:90|95|100)|data-closed:zoom-out-(?:90|95|100)|data-\\[side=${SIDE}\\]:slide-in-from-${SIDE}-[0-4])$`
);
// Sheet's slide distance and overlay duration compete with literals in the component source,
// so they are only accepted with the important modifier (see `sheet-tuning.ts`).
const SHEET_CONTENT_UTILITY = new RegExp(
	`^(?:gap-${N}|duration-${TIER}|data-\\[side=(?:left|right)\\]:sm:max-w-(?:sm|md|lg|xl|2xl)|data-\\[side=${SIDE}\\]:data-(?:open:slide-in-from|closed:slide-out-to)-${SIDE}(?:-(?:4|6|10|16|24))?!)$`
);
const SHEET_OVERLAY_UTILITY = new RegExp(
	`^(?:bg-black/(?:0|10|20|30|40|50|60|70|80)|duration-${TIER}!)$`
);
const SHEET_PADDING_UTILITY = new RegExp(`^p-${N}$`);
const DRAWER_CONTENT_UTILITY = new RegExp(
	`^(?:before:rounded-${RADIUS}|data-\\[vaul-drawer-direction=(?:bottom|top)\\]:rounded-(?:t|b)-${RADIUS}|data-\\[vaul-drawer-direction=(?:left|right)\\]:rounded-(?:l|r)-${RADIUS})$`
);
const DRAWER_FOOTER_UTILITY = new RegExp(`^(?:p|gap)-${N}$`);
const DRAWER_OVERLAY_UTILITY = /^bg-black\/(?:0|10|20|30|40|50|60|70|80)$/;
const INPUT_UTILITY = new RegExp(`^(?:(?:h|px)-${N}|rounded-${RADIUS})$`);
const TEXTAREA_UTILITY = new RegExp(`^(?:(?:px|py)-${N}|rounded-${RADIUS})$`);
const SELECT_TRIGGER_UTILITY = new RegExp(
	`^(?:data-\\[size=(?:default|sm)\\]:h-${N}|pl-${N}|(?:data-\\[size=sm\\]:)?rounded-${RADIUS})$`
);
const ZOOM = "(?:90|95|100)";
const MENU_PANEL_UTILITY = `p-${N}|rounded-${RADIUS}|duration-${TIER}|data-open:zoom-in-${ZOOM}|data-closed:zoom-out-${ZOOM}|data-\\[side=${SIDE}\\]:slide-in-from-${SIDE}-[0-4]`;
const DROPDOWN_MENU_CONTENT_UTILITY = new RegExp(`^(?:${MENU_PANEL_UTILITY}|min-w-${N})$`);
const DROPDOWN_MENU_SUB_CONTENT_UTILITY = new RegExp(`^(?:${MENU_PANEL_UTILITY})$`);
const DROPDOWN_MENU_ITEM_UTILITY = new RegExp(
	`^(?:(?:px|py|gap)-${N}|rounded-${RADIUS}|data-inset:pl-${N})$`
);
const DROPDOWN_MENU_CHOICE_UTILITY = new RegExp(
	`^(?:(?:pl|py|gap)-${N}|rounded-${RADIUS}|data-inset:pl-${N})$`
);
const DROPDOWN_MENU_LABEL_UTILITY = new RegExp(`^(?:px-${N}|data-inset:pl-${N})$`);
const DROPDOWN_MENU_SEPARATOR_UTILITY = new RegExp(`^-mx-${N}$`);
const TOOLTIP_CONTENT_UTILITY = new RegExp(
	`^(?:(?:px|py)-${N}|rounded-${RADIUS}|duration-${TIER}|data-open:zoom-in-${ZOOM}|data-\\[state=delayed-open\\]:zoom-in-${ZOOM}|data-closed:zoom-out-${ZOOM})$`
);
// Show delay in ms, read by `tooltip-provider.svelte` after flattening.
const TOOLTIP_PROVIDER_UTILITY = /^delay-(?:0|[1-9]\d{0,3})$/;
// Card's existing variable is shared by section gaps, insets and edge-to-edge content.
// Only this property and the finite 0–48px / 2px scale are accepted, not arbitrary CSS.
const CARD_SPACING = String.raw`(?:0|[1-9]|1[0-2]|[0-9]\.5|1[01]\.5)`;
const CARD_UTILITY = new RegExp(
	`^(?:(?:data-\\[size=sm\\]:)?\\[--card-spacing:--spacing\\(${CARD_SPACING}\\)\\]|rounded-${RADIUS}|\\*:\\[img:first-child\\]:rounded-t-${RADIUS}|\\*:\\[img:last-child\\]:rounded-b-${RADIUS})$`
);
const TABS_LIST_UTILITY = new RegExp(
	`^(?:group-data-horizontal/tabs:h-(?:8|9|10)|(?:group-data-vertical/tabs:)?p-(?:0\\.75|1)|(?:group-data-vertical/tabs:)?data-\\[variant=default\\]:rounded-${RADIUS})$`
);
const TABS_TRIGGER_UTILITY = new RegExp(
	`^(?:(?:group-data-vertical/tabs:)?(?:px-(?:1|1\\.5|2|2\\.5|3|3\\.5|4)|py-(?:0|0\\.5|1|1\\.5|2)|rounded-${RADIUS})|has-data-\\[icon=inline-start\\]:pl-(?:1|1\\.5|2|2\\.5|3|3\\.5|4)|has-data-\\[icon=inline-end\\]:pr-(?:1|1\\.5|2|2\\.5|3|3\\.5|4))$`
);
const INPUT_GROUP_UTILITY = new RegExp(
	`^(?:h-${N}|(?:has-data-\\[align=block-(?:start|end)\\]:|has-\\[textarea\\]:)?rounded-${RADIUS}|not-has-\\[>\\[data-align=block-start\\]\\]:not-has-\\[>\\[data-align=block-end\\]\\]:\\[&>input\\]:h-full)$`
);
// Nova/Mira track insets require fractional pixels: Tailwind rejects spacing like h-4.6.
// Only the 16 literal heights produced by the 10–24px thumb scale are accepted.
const SWITCH_HEIGHT = String.raw`\[(?:1[2468]|2[0246])\.[46]px\]`;

export const OVERRIDE_RULES: Record<string, RegExp> = {
	...Object.fromEntries(
		[
			"cn-button",
			"cn-button-size-xs",
			"cn-button-size-sm",
			"cn-button-size-default",
			"cn-button-size-lg",
			"cn-button-size-icon-xs",
			"cn-button-size-icon-sm",
			"cn-button-size-icon",
			"cn-button-size-icon-lg",
		].map((className) => [className, BUTTON_UTILITY])
	),
	"cn-dialog-content": DIALOG_CONTENT_UTILITY,
	"cn-dialog-overlay": DIALOG_OVERLAY_UTILITY,
	"cn-dialog-footer": DIALOG_FOOTER_UTILITY,
	"cn-accordion-trigger": /^(?:px|py)-(?:[0-7](?:\.5)?|8)$/,
	"cn-accordion-content": /^px-(?:[0-7](?:\.5)?|8)$/,
	"cn-accordion-content-inner": /^pb-(?:[0-9](?:\.5)?|10)$/,
	"cn-alert-dialog-content": new RegExp(
		`^(?:p-(?:[2-9](?:\\.5)?|1[01](?:\\.5)?|12)|gap-(?:[1-9](?:\\.5)?|10)|rounded-${RADIUS}|data-\\[size=default\\]:sm:max-w-(?:sm|md|lg|xl|2xl)|duration-${TIER}|data-open:zoom-in-${ZOOM}|data-closed:zoom-out-${ZOOM})$`
	),
	"cn-alert-dialog-overlay": DIALOG_OVERLAY_UTILITY,
	"cn-alert-dialog-footer": new RegExp(
		`^(?:(?:-m[xb]|p)-(?:[2-9](?:\\.5)?|1[01](?:\\.5)?|12)|rounded-b-${RADIUS})$`
	),
	"cn-popover-content": POPOVER_CONTENT_UTILITY,
	"cn-hover-card-content": new RegExp(
		`^(?:p-${N}|rounded-${RADIUS}|duration-${TIER}|data-open:zoom-in-${ZOOM}|data-closed:zoom-out-${ZOOM}|data-\\[side=${SIDE}\\]:slide-in-from-${SIDE}-[0-4])$`
	),
	"cn-drawer-content": DRAWER_CONTENT_UTILITY,
	"cn-drawer-overlay": DRAWER_OVERLAY_UTILITY,
	"cn-drawer-header": SHEET_PADDING_UTILITY,
	"cn-drawer-footer": DRAWER_FOOTER_UTILITY,
	"cn-sheet-content": SHEET_CONTENT_UTILITY,
	"cn-sheet-overlay": SHEET_OVERLAY_UTILITY,
	"cn-sheet-header": SHEET_PADDING_UTILITY,
	"cn-sheet-footer": SHEET_PADDING_UTILITY,
	"cn-input": INPUT_UTILITY,
	"cn-textarea": TEXTAREA_UTILITY,
	"cn-select-trigger": SELECT_TRIGGER_UTILITY,
	"cn-native-select": SELECT_TRIGGER_UTILITY,
	"cn-input-group": INPUT_GROUP_UTILITY,
	"cn-input-group-addon": /^(?:gap)-(?:[0-5](?:\.5)?|6)$/,
	"cn-input-group-addon-align-inline-start": new RegExp(`^pl-${CARD_SPACING}$`),
	"cn-input-group-addon-align-inline-end": new RegExp(`^pr-${CARD_SPACING}$`),
	"cn-input-group-addon-align-block-start": new RegExp(`^px-${CARD_SPACING}$`),
	"cn-input-group-addon-align-block-end": new RegExp(`^px-${CARD_SPACING}$`),
	"cn-input-otp": /^gap-(?:[0-5](?:\.5)?|6)$/,
	"cn-input-otp-group": new RegExp(`^rounded-${RADIUS}$`),
	"cn-input-otp-slot": new RegExp(
		`^(?:size-${N}|(?:first:|last:)?rounded-none|first:rounded-l-${RADIUS}|last:rounded-r-${RADIUS}|first:last:rounded-${RADIUS})$`
	),
	"cn-dropdown-menu-content": DROPDOWN_MENU_CONTENT_UTILITY,
	"cn-dropdown-menu-sub-content": DROPDOWN_MENU_SUB_CONTENT_UTILITY,
	"cn-dropdown-menu-item": DROPDOWN_MENU_ITEM_UTILITY,
	"cn-dropdown-menu-sub-trigger": DROPDOWN_MENU_ITEM_UTILITY,
	"cn-dropdown-menu-checkbox-item": DROPDOWN_MENU_CHOICE_UTILITY,
	"cn-dropdown-menu-radio-item": DROPDOWN_MENU_CHOICE_UTILITY,
	"cn-dropdown-menu-label": DROPDOWN_MENU_LABEL_UTILITY,
	"cn-dropdown-menu-separator": DROPDOWN_MENU_SEPARATOR_UTILITY,
	"cn-context-menu-content": DROPDOWN_MENU_CONTENT_UTILITY,
	"cn-context-menu-sub-content": DROPDOWN_MENU_SUB_CONTENT_UTILITY,
	"cn-context-menu-item": DROPDOWN_MENU_ITEM_UTILITY,
	"cn-context-menu-sub-trigger": DROPDOWN_MENU_ITEM_UTILITY,
	"cn-context-menu-checkbox-item": DROPDOWN_MENU_CHOICE_UTILITY,
	"cn-context-menu-radio-item": DROPDOWN_MENU_CHOICE_UTILITY,
	"cn-context-menu-label": DROPDOWN_MENU_LABEL_UTILITY,
	"cn-context-menu-separator": DROPDOWN_MENU_SEPARATOR_UTILITY,
	"cn-tooltip-content": TOOLTIP_CONTENT_UTILITY,
	"cn-tooltip-provider": TOOLTIP_PROVIDER_UTILITY,
	"cn-number-field": new RegExp(`^(?:(?:h|min-h)-\\d+(?:\\.(?:25|5|75))?|rounded-${RADIUS})$`),
	"cn-number-field-input": /^(?:h-full|px-(?:[0-3](?:\.5)?|4))$/,
	"cn-number-field-decrement": new RegExp(
		`^(?:size-full|w-auto|aspect-square|rounded-s-${RADIUS})$`
	),
	"cn-number-field-increment": new RegExp(
		`^(?:size-full|w-auto|aspect-square|rounded-e-${RADIUS})$`
	),
	"cn-slider-field": /^(?:gap-x-(?:[0-7](?:\.5)?|8)|gap-y-(?:[0-5](?:\.5)?|6))$/,
	"cn-slider-field-value": /^w-(?:2[468]|3[02468]|4[02468])$/,
	"cn-avatar": new RegExp(
		`^(?:(?:data-\\[size=(?:sm|lg)\\]:)?size-(?:[5-9]|1[0-6])|(?:after:)?rounded-${RADIUS})$`
	),
	"cn-avatar-image": new RegExp(`^rounded-${RADIUS}$`),
	"cn-avatar-fallback": new RegExp(`^rounded-${RADIUS}$`),
	"cn-avatar-group-count": new RegExp(
		`^(?:(?:group-has-data-\\[size=(?:sm|lg)\\]/avatar-group:)?(?:size-(?:[5-9]|1[0-6])|\\[&>svg\\]:size-(?:2\\.5|[3-7](?:\\.5)?|8))|rounded-${RADIUS})$`
	),
	"cn-avatar-badge":
		/^group-data-\[size=(?:sm|default|lg)\]\/avatar:size-(?:1\.75|[23](?:\.(?:25|5|75))?|4(?:\.(?:25|5))?)!$/,
	"cn-item": new RegExp(`^rounded-${RADIUS}$`),
	...Object.fromEntries(
		["default", "sm", "xs"].map((size) => [
			`cn-item-size-${size}`,
			/^(?:px-(?:[0-7](?:\.5)?|8)|(?:py|gap)-(?:[0-5](?:\.5)?|6))$/,
		])
	),
	"cn-alert": new RegExp(
		`^(?:px-(?:[0-7](?:\\.5)?|8)|py-(?:[0-5](?:\\.5)?|6)|gap-y-(?:[0-3](?:\\.5)?|4)|rounded-${RADIUS})$`
	),
	"cn-empty": new RegExp(
		`^(?:p-(?:[2-9](?:\\.5)?|1[0-5](?:\\.5)?|16)|gap-(?:[0-7](?:\\.5)?|8)|rounded-${RADIUS})$`
	),
	"cn-badge": new RegExp(
		`^(?:px-(?:[0-5](?:\\.5)?|6)|gap-(?:[0-3](?:\\.5)?|4)|rounded-${RADIUS})$`
	),
	"cn-table-head": /^(?:h-(?:[6-9](?:\.5)?|1[0-5](?:\.5)?|16)|px-(?:[0-7](?:\.5)?|8))$/,
	"cn-table-cell": /^(?:px-(?:[0-7](?:\.5)?|8)|py-(?:[0-5](?:\.5)?|6))$/,
	"cn-card": CARD_UTILITY,
	"cn-card-header": new RegExp(`^(?:gap-${N}|rounded-t-${RADIUS})$`),
	"cn-card-footer": new RegExp(`^rounded-b-${RADIUS}$`),
	"cn-tabs": new RegExp(`^gap-${N}$`),
	"cn-tabs-list": TABS_LIST_UTILITY,
	"cn-tabs-trigger": TABS_TRIGGER_UTILITY,
	"cn-checkbox": new RegExp(`^(?:size-${N}|rounded-${RADIUS})$`),
	"cn-checkbox-indicator": new RegExp(`^\\[&>svg\\]:size-${N}$`),
	"cn-radio-group": new RegExp(`^gap-${N}$`),
	"cn-radio-group-item": new RegExp(`^size-${N}$`),
	"cn-radio-group-indicator": new RegExp(`^size-${N}$`),
	"cn-radio-group-indicator-icon": new RegExp(`^(?:dark:)?size-${N}$`),
	"cn-switch": new RegExp(
		`^(?:data-\\[size=(?:default|sm)\\]:(?:(?:h|w)-${N}|h-${SWITCH_HEIGHT})|rounded-${RADIUS}|duration-${TIER})$`
	),
	"cn-switch-thumb": new RegExp(
		`^(?:group-data-\\[size=(?:default|sm)\\]/switch:(?:h|w)-${N}|rounded-${RADIUS}|duration-${TIER})$`
	),
	"cn-toggle": new RegExp(`^(?:gap-(?:[0-3](?:\\.5)?|4)|rounded-${RADIUS})$`),
	...Object.fromEntries(
		["sm", "default", "lg"].map((size) => [
			`cn-toggle-size-${size}`,
			new RegExp(
				`^(?:(?:h|min-w)-(?:[5-9](?:\\.5)?|1[0-5](?:\\.5)?|16)|px-(?:[0-9](?:\\.5)?|1[01](?:\\.5)?|12)|rounded-${RADIUS})$`
			),
		])
	),
	"cn-toggle-group": new RegExp(
		`^(?:data-\\[size=sm\\]:|data-\\[spacing=0\\]:data-\\[variant=outline\\]:)?rounded-${RADIUS}$`
	),
	"cn-toggle-group-item": new RegExp(
		`^(?:group-data-\\[spacing=0\\]/toggle-group:(?:px-(?:[0-9](?:\\.5)?|1[01](?:\\.5)?|12)|rounded-none)|(?:group-data-horizontal/toggle-group:data-\\[spacing=0\\]:(?:first:rounded-l|last:rounded-r)|group-data-vertical/toggle-group:data-\\[spacing=0\\]:(?:first:rounded-t|last:rounded-b))-${RADIUS})$`
	),
	"cn-slider-track": new RegExp(
		`^(?:(?:data-horizontal:h|data-vertical:w)-(?:0\\.5|[1-3](?:\\.5)?|4)|rounded-${RADIUS})$`
	),
	"cn-slider-thumb": new RegExp(
		`^(?:(?:size|h|data-vertical:w)-(?:[3-7](?:\\.5)?|8)|(?:w|data-vertical:h)-(?:[5-9](?:\\.5)?|10)|rounded-${RADIUS})$`
	),
};

export const styleOverridePayloadSchema = z
	.object({
		style: z.string().regex(/^[a-z]+$/),
		classes: z.record(z.string(), z.string().max(600)).refine(
			(classes) =>
				Object.entries(classes).every(([className, value]) => {
					const rule = OVERRIDE_RULES[className];
					const tokens = value.trim().split(/\s+/);
					return rule && tokens[0] !== "" && tokens.every((token) => rule.test(token));
				}),
			"只允许组件自己的尺寸、间距、圆角档位和动效档位工具类"
		),
	})
	.strict();
export type StyleOverridePayload = z.infer<typeof styleOverridePayloadSchema>;

export function styleOverridePath(style: string): string {
	return `src/lib/registry/styles/valar/style-${style}.css`;
}

function styleLabel(style: string): string {
	return style.charAt(0).toUpperCase() + style.slice(1);
}

/** Every write regenerates the whole file from its parsed map, so the output stays canonical. */
export function serializeStyleOverrides(style: string, map: Record<string, string>): string {
	const rules = Object.entries(map)
		.map(([className, classes]) => `\t.${className} {\n\t\t@apply ${classes};\n\t}\n`)
		.join("\n");
	return `/*
 * Valar 定制样式（${styleLabel(style)}）。叠加在同名上游样式之上，冲突的工具类以此处为准。
 * 组件文档页的“写回组件库”会重写本文件；也可以手动编辑。上游文件保持原样。
 */
.style-${style} {
${rules}}
`;
}

/**
 * Later writes replace conflicting utilities of the same kind (`h-11` replaces `h-9`,
 * `duration-normal` replaces `duration-fast`)
 * and keep the rest, so earlier write-backs for other sizes are not lost.
 */
export function applyStyleOverrides(existingCss: string, payload: StyleOverridePayload): string {
	const map = parseStyleCss(existingCss);
	for (const [className, classes] of Object.entries(payload.classes)) {
		if (classes) map[className] = mergeClasses(map[className] ?? "", classes.trim());
	}
	return serializeStyleOverrides(payload.style, map);
}
