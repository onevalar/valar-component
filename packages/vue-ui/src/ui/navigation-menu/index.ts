import * as Reka from "reka-ui";
import { styledPart } from "../dropdown-menu/parts.js";

export { default as NavigationMenu } from "./NavigationMenu.vue";
export { default as NavigationMenuTrigger } from "./NavigationMenuTrigger.vue";
export { default as NavigationMenuViewport } from "./NavigationMenuViewport.vue";
export { default as NavigationMenuIndicator } from "./NavigationMenuIndicator.vue";

export const NavigationMenuList = styledPart(
	Reka.NavigationMenuList,
	"navigation-menu-list",
	"cn-navigation-menu-list group flex flex-1 list-none items-center justify-center"
);
export const NavigationMenuItem = styledPart(
	Reka.NavigationMenuItem,
	"navigation-menu-item",
	"relative"
);
export const NavigationMenuLink = styledPart(
	Reka.NavigationMenuLink,
	"navigation-menu-link",
	"cn-navigation-menu-link"
);
export const NavigationMenuContent = styledPart(
	Reka.NavigationMenuContent,
	"navigation-menu-content",
	"cn-navigation-menu-content w-max max-w-[calc(100dvw-20px)] group-data-[viewport=false]/navigation-menu:absolute group-data-[viewport=false]/navigation-menu:start-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:z-50 group-data-[viewport=false]/navigation-menu:mt-1.5"
);

export const navigationMenuTriggerStyle = () =>
	"cn-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none";
