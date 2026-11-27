import * as Reka from "reka-ui";
import {
	menuCheckbox,
	menuContent,
	menuItem,
	menuLabel,
	menuRadio,
	menuShortcut,
	menuSub,
	menuSubTrigger,
	styledPart,
} from "./parts.js";

export { DropdownMenuRoot as DropdownMenu, DropdownMenuPortal } from "reka-ui";
export { default as DropdownMenuCheckboxGroup } from "./DropdownMenuCheckboxGroup.vue";
export const DropdownMenuTrigger = styledPart(Reka.DropdownMenuTrigger, "dropdown-menu-trigger");
export const DropdownMenuGroup = styledPart(Reka.DropdownMenuGroup, "dropdown-menu-group");
export const DropdownMenuRadioGroup = styledPart(
	Reka.DropdownMenuRadioGroup,
	"dropdown-menu-radio-group"
);
export const DropdownMenuLabel = menuLabel(
	Reka.Primitive,
	"dropdown-menu-label",
	"cn-dropdown-menu-label"
);
export const DropdownMenuGroupHeading = menuLabel(
	Reka.DropdownMenuLabel,
	"dropdown-menu-group-heading",
	"cn-dropdown-menu-label"
);
export const DropdownMenuSeparator = styledPart(
	Reka.DropdownMenuSeparator,
	"dropdown-menu-separator",
	"cn-dropdown-menu-separator"
);
export const DropdownMenuShortcut = menuShortcut(
	"dropdown-menu-shortcut",
	"cn-dropdown-menu-shortcut"
);
export const DropdownMenuItem = menuItem(
	Reka.DropdownMenuItem,
	"dropdown-menu-item",
	"cn-dropdown-menu-item group/dropdown-menu-item"
);
export const DropdownMenuCheckboxItem = menuCheckbox(
	Reka.DropdownMenuCheckboxItem,
	Reka.DropdownMenuItemIndicator,
	"dropdown-menu-checkbox-item",
	"cn-dropdown-menu-checkbox-item",
	"cn-dropdown-menu-item-indicator pointer-events-none"
);
export const DropdownMenuRadioItem = menuRadio(
	Reka.DropdownMenuRadioItem,
	Reka.DropdownMenuItemIndicator,
	"dropdown-menu-radio-item",
	"cn-dropdown-menu-radio-item",
	"cn-dropdown-menu-item-indicator pointer-events-none"
);
export const DropdownMenuSub = menuSub(Reka.DropdownMenuSub, "DropdownMenuSub");
export const DropdownMenuSubTrigger = menuSubTrigger(
	Reka.DropdownMenuSubTrigger,
	"dropdown-menu-sub-trigger",
	"cn-dropdown-menu-sub-trigger"
);

type Appearance = { appearance?: "default" | "surface" };
export const DropdownMenuContent = menuContent<typeof Reka.DropdownMenuContent, Appearance>(
	Reka.DropdownMenuContent,
	Reka.DropdownMenuPortal,
	"dropdown-menu-content",
	"cn-dropdown-menu-content cn-overlay-surface cn-dropdown-menu-surface",
	{
		defaults: { align: "start", sideOffset: 4 },
		style: ({ appearance = "default" }) => ({
			attrs: { "data-appearance": appearance },
			classes:
				appearance === "surface" ? "animate-none!" : "w-(--reka-dropdown-menu-trigger-width)",
		}),
	}
);

export const DropdownMenuSubContent = menuContent<typeof Reka.DropdownMenuSubContent, Appearance>(
	Reka.DropdownMenuSubContent,
	Reka.DropdownMenuPortal,
	"dropdown-menu-sub-content",
	"cn-dropdown-menu-sub-content cn-overlay-surface cn-dropdown-menu-surface",
	{
		sub: true,
		defaults: { alignOffset: -3 },
		style: ({ appearance = "default" }) => ({
			attrs: { "data-appearance": appearance },
			classes: appearance === "surface" ? "animate-none!" : undefined,
		}),
	}
);
