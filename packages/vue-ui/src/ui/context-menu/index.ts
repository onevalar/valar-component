import {
	menuCheckbox,
	menuContent,
	menuGroup,
	menuItem,
	menuLabel,
	menuPortal,
	menuRadio,
	menuRadioGroup,
	menuSeparator,
	menuShortcut,
	menuSub,
	menuSubTrigger,
} from "../dropdown-menu/parts.js";

export const ContextMenuPortal = menuPortal("ContextMenuPortal");
export { default as ContextMenu } from "./ContextMenu.vue";
export { default as ContextMenuTrigger } from "./ContextMenuTrigger.vue";
export const ContextMenuGroup = menuGroup("context-menu-group");
export const ContextMenuRadioGroup = menuRadioGroup("context-menu-radio-group");
export const ContextMenuLabel = menuLabel("context-menu-label", "cn-context-menu-label");
export const ContextMenuGroupHeading = menuLabel(
	"context-menu-group-heading",
	"cn-context-menu-label"
);
export const ContextMenuSeparator = menuSeparator(
	"context-menu-separator",
	"cn-context-menu-separator"
);
export const ContextMenuShortcut = menuShortcut(
	"context-menu-shortcut",
	"cn-context-menu-shortcut"
);
export const ContextMenuItem = menuItem(
	"context-menu-item",
	"cn-context-menu-item group/context-menu-item"
);
export const ContextMenuCheckboxItem = menuCheckbox(
	"context-menu-checkbox-item",
	"cn-context-menu-checkbox-item",
	"context-menu-item-indicator",
	"cn-context-menu-item-indicator pointer-events-none"
);
export const ContextMenuRadioItem = menuRadio(
	"context-menu-radio-item",
	"cn-context-menu-radio-item",
	"context-menu-item-indicator",
	"cn-context-menu-item-indicator pointer-events-none"
);
export const ContextMenuSub = menuSub("ContextMenuSub");
export const ContextMenuSubTrigger = menuSubTrigger(
	"context-menu-sub-trigger",
	"cn-context-menu-sub-trigger"
);

export const ContextMenuContent = menuContent(
	"context-menu-content",
	"cn-context-menu-content cn-overlay-surface cn-context-menu-surface"
);

export const ContextMenuSubContent = menuContent<{ elevated?: boolean }>(
	"context-menu-sub-content",
	"cn-context-menu-sub-content cn-overlay-surface cn-context-menu-surface",
	{
		sub: true,
		defaults: { alignOffset: -3 },
		style: ({ elevated }) => ({
			attrs: { "data-elevated": elevated !== undefined && elevated !== false ? "" : undefined },
			classes: "cn-context-menu-sub-elevated",
		}),
	}
);
