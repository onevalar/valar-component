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
} from "../dropdown-menu/parts.js";

export { MenubarMenu, MenubarPortal } from "reka-ui";
export { default as Menubar } from "./Menubar.vue";
export const MenubarTrigger = styledPart(
	Reka.MenubarTrigger,
	"menubar-trigger",
	"cn-menubar-trigger flex items-center outline-hidden select-none"
);
export const MenubarGroup = styledPart(Reka.MenubarGroup, "menubar-group");
export const MenubarRadioGroup = styledPart(Reka.MenubarRadioGroup, "menubar-radio-group");
export const MenubarLabel = menuLabel(Reka.Primitive, "menubar-label", "cn-menubar-label");
export const MenubarGroupHeading = menuLabel(
	Reka.MenubarLabel,
	"menubar-group-heading",
	"cn-menubar-label"
);
export const MenubarSeparator = styledPart(
	Reka.MenubarSeparator,
	"menubar-separator",
	"cn-menubar-separator -mx-1 my-1 h-px"
);
export const MenubarShortcut = menuShortcut("menubar-shortcut", "cn-menubar-shortcut ms-auto");
export const MenubarItem = menuItem(
	Reka.MenubarItem,
	"menubar-item",
	"cn-menubar-item group/menubar-item"
);
export const MenubarCheckboxItem = menuCheckbox(
	Reka.MenubarCheckboxItem,
	Reka.MenubarItemIndicator,
	"menubar-checkbox-item",
	"cn-menubar-checkbox-item",
	"cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center"
);
export const MenubarRadioItem = menuRadio(
	Reka.MenubarRadioItem,
	Reka.MenubarItemIndicator,
	"menubar-radio-item",
	"cn-menubar-radio-item",
	"cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center"
);
export const MenubarSub = menuSub(Reka.MenubarSub, "MenubarSub");
export const MenubarSubTrigger = menuSubTrigger(
	Reka.MenubarSubTrigger,
	"menubar-sub-trigger",
	"cn-menubar-sub-trigger"
);
export const MenubarContent = menuContent(
	Reka.MenubarContent,
	Reka.MenubarPortal,
	"menubar-content",
	"cn-menubar-content",
	{
		defaults: { align: "start", alignOffset: -4, side: "bottom", sideOffset: 8 },
	}
);
export const MenubarSubContent = menuContent(
	Reka.MenubarSubContent,
	Reka.MenubarPortal,
	"menubar-sub-content",
	"cn-menubar-sub-content",
	{
		sub: true,
		defaults: { alignOffset: -3 },
	}
);
