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
import type { ContextMenuContentEmits } from "reka-ui";

export { ContextMenuPortal } from "reka-ui";
export { default as ContextMenu } from "./ContextMenu.vue";
export { default as ContextMenuTrigger } from "./ContextMenuTrigger.vue";
export const ContextMenuGroup = styledPart(Reka.ContextMenuGroup, "context-menu-group");
export const ContextMenuRadioGroup = styledPart(
	Reka.ContextMenuRadioGroup,
	"context-menu-radio-group"
);
export const ContextMenuLabel = menuLabel(
	Reka.Primitive,
	"context-menu-label",
	"cn-context-menu-label"
);
export const ContextMenuGroupHeading = menuLabel(
	Reka.ContextMenuLabel,
	"context-menu-group-heading",
	"cn-context-menu-label"
);
export const ContextMenuSeparator = styledPart(
	Reka.ContextMenuSeparator,
	"context-menu-separator",
	"cn-context-menu-separator"
);
export const ContextMenuShortcut = menuShortcut(
	"context-menu-shortcut",
	"cn-context-menu-shortcut"
);
export const ContextMenuItem = menuItem(
	Reka.ContextMenuItem,
	"context-menu-item",
	"cn-context-menu-item group/context-menu-item"
);
export const ContextMenuCheckboxItem = menuCheckbox(
	Reka.ContextMenuCheckboxItem,
	Reka.ContextMenuItemIndicator,
	"context-menu-checkbox-item",
	"cn-context-menu-checkbox-item",
	"cn-context-menu-item-indicator pointer-events-none"
);
export const ContextMenuRadioItem = menuRadio(
	Reka.ContextMenuRadioItem,
	Reka.ContextMenuItemIndicator,
	"context-menu-radio-item",
	"cn-context-menu-radio-item",
	"cn-context-menu-item-indicator pointer-events-none"
);
export const ContextMenuSub = menuSub(Reka.ContextMenuSub, "ContextMenuSub");
export const ContextMenuSubTrigger = menuSubTrigger(
	Reka.ContextMenuSubTrigger,
	"context-menu-sub-trigger",
	"cn-context-menu-sub-trigger"
);

export const ContextMenuContent = menuContent(
	Reka.ContextMenuContent,
	Reka.ContextMenuPortal,
	"context-menu-content",
	"cn-context-menu-content cn-overlay-surface cn-context-menu-surface",
	{
		setup() {
			const root = Reka.injectContextMenuRootContext();
			let interactedOutside = false;
			return {
				onInteractOutside(event: ContextMenuContentEmits["interactOutside"][0]) {
					if (
						!event.defaultPrevented &&
						(!root.modal.value || event.detail.originalEvent.type === "pointerdown")
					)
						interactedOutside = true;
				},
				onCloseAutoFocus(event: Event) {
					if (!event.defaultPrevented && !interactedOutside && root.triggerElement.value) {
						event.preventDefault();
						root.triggerElement.value.focus({ preventScroll: true });
					}
					interactedOutside = false;
				},
			};
		},
	}
);

export const ContextMenuSubContent = menuContent<
	typeof Reka.ContextMenuSubContent,
	{ elevated?: boolean }
>(
	Reka.ContextMenuSubContent,
	Reka.ContextMenuPortal,
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
