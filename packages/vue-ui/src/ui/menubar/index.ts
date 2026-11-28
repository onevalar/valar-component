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
	menuTrigger,
} from "../dropdown-menu/parts.js";

export const MenubarPortal = menuPortal("MenubarPortal");
export { default as Menubar } from "./Menubar.vue";
export { default as MenubarMenu } from "./MenubarMenu.vue";
export const MenubarTrigger = menuTrigger(
	"menubar-trigger",
	"cn-menubar-trigger flex items-center outline-hidden select-none"
);
export const MenubarGroup = menuGroup("menubar-group");
export const MenubarRadioGroup = menuRadioGroup("menubar-radio-group");
export const MenubarLabel = menuLabel("menubar-label", "cn-menubar-label");
export const MenubarGroupHeading = menuLabel("menubar-group-heading", "cn-menubar-label");
export const MenubarSeparator = menuSeparator(
	"menubar-separator",
	"cn-menubar-separator -mx-1 my-1 h-px"
);
export const MenubarShortcut = menuShortcut("menubar-shortcut", "cn-menubar-shortcut ms-auto");
export const MenubarItem = menuItem("menubar-item", "cn-menubar-item group/menubar-item");
export const MenubarCheckboxItem = menuCheckbox(
	"menubar-checkbox-item",
	"cn-menubar-checkbox-item",
	"menubar-checkbox-item-indicator",
	"cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center"
);
export const MenubarRadioItem = menuRadio(
	"menubar-radio-item",
	"cn-menubar-radio-item",
	"menubar-radio-item-indicator",
	"cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center"
);
export const MenubarSub = menuSub("MenubarSub");
export const MenubarSubTrigger = menuSubTrigger(
	"menubar-sub-trigger",
	"cn-menubar-sub-trigger"
);
export const MenubarContent = menuContent("menubar-content", "cn-menubar-content", {
	defaults: { align: "start", alignOffset: -4, side: "bottom", sideOffset: 8 },
});
export const MenubarSubContent = menuContent("menubar-sub-content", "cn-menubar-sub-content", {
	sub: true,
	defaults: { alignOffset: -3 },
});
