import {
	menuCheckbox,
	menuContent,
	menuGroup,
	menuItem,
	menuLabel,
	menuPortal,
	menuRadio,
	menuRadioGroup,
	menuRoot,
	menuSeparator,
	menuShortcut,
	menuSub,
	menuSubTrigger,
	menuTrigger,
} from "./parts.js";

export const DropdownMenu = menuRoot("DropdownMenu");
export const DropdownMenuPortal = menuPortal("DropdownMenuPortal");
export { default as DropdownMenuCheckboxGroup } from "./DropdownMenuCheckboxGroup.vue";
export const DropdownMenuTrigger = menuTrigger("dropdown-menu-trigger");
export const DropdownMenuGroup = menuGroup("dropdown-menu-group");
export const DropdownMenuRadioGroup = menuRadioGroup("dropdown-menu-radio-group");
export const DropdownMenuLabel = menuLabel("dropdown-menu-label", "cn-dropdown-menu-label");
export const DropdownMenuGroupHeading = menuLabel(
	"dropdown-menu-group-heading",
	"cn-dropdown-menu-label"
);
export const DropdownMenuSeparator = menuSeparator(
	"dropdown-menu-separator",
	"cn-dropdown-menu-separator"
);
export const DropdownMenuShortcut = menuShortcut(
	"dropdown-menu-shortcut",
	"cn-dropdown-menu-shortcut"
);
export const DropdownMenuItem = menuItem(
	"dropdown-menu-item",
	"cn-dropdown-menu-item group/dropdown-menu-item"
);
export const DropdownMenuCheckboxItem = menuCheckbox(
	"dropdown-menu-checkbox-item",
	"cn-dropdown-menu-checkbox-item",
	"dropdown-menu-checkbox-item-indicator",
	"cn-dropdown-menu-item-indicator pointer-events-none"
);
export const DropdownMenuRadioItem = menuRadio(
	"dropdown-menu-radio-item",
	"cn-dropdown-menu-radio-item",
	"dropdown-menu-radio-item-indicator",
	"cn-dropdown-menu-item-indicator pointer-events-none"
);
export const DropdownMenuSub = menuSub("DropdownMenuSub");
export const DropdownMenuSubTrigger = menuSubTrigger(
	"dropdown-menu-sub-trigger",
	"cn-dropdown-menu-sub-trigger"
);

type Appearance = { appearance?: "default" | "surface" };
export const DropdownMenuContent = menuContent<Appearance>(
	"dropdown-menu-content",
	"cn-dropdown-menu-content cn-overlay-surface cn-dropdown-menu-surface",
	{
		defaults: { side: "bottom", align: "start", sideOffset: 4 },
		style: ({ appearance = "default" }) => ({
			attrs: { "data-appearance": appearance },
			classes: appearance === "surface" ? "animate-none!" : "w-(--anchor-width)",
		}),
	}
);

export const DropdownMenuSubContent = menuContent<Appearance>(
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
