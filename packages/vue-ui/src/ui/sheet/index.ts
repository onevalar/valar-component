import { cn } from "cn";
import { defineComponent, h, type Component, type HTMLAttributes, type PropType } from "vue";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
} from "../dialog/index.js";
import { styledPart } from "../dropdown-menu/parts.js";

function makeDivPart(slotName: string, baseClass: string) {
	return defineComponent({
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: "div" },
			asChild: Boolean,
			class: { type: [String, Array, Object] as PropType<HTMLAttributes["class"]>, default: undefined },
		},
		setup(props, { slots }) {
			return () =>
				h(
					props.as as any,
					{ "data-slot": slotName, class: cn(baseClass, props.class) },
					slots.default?.()
				);
		},
	});
}

export { Dialog as Sheet, DialogPortal as SheetPortal };
export { default as SheetContent, type SheetSide } from "./SheetContent.vue";
export { default as SheetPanel } from "./SheetPanel.vue";
export const SheetTrigger = styledPart(DialogTrigger, "sheet-trigger");
export const SheetClose = styledPart(DialogClose, "sheet-close");
export const SheetOverlay = styledPart(
	DialogOverlay,
	"sheet-overlay",
	"cn-sheet-overlay fixed inset-0 z-50 duration-100 motion-reduce:animate-none! data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
);
export const SheetHeader = makeDivPart("sheet-header", "cn-sheet-header flex flex-col");
export const SheetFooter = makeDivPart("sheet-footer", "cn-sheet-footer mt-auto flex flex-col");
export const SheetTitle = styledPart(DialogTitle, "sheet-title", "cn-font-heading cn-sheet-title");
export const SheetDescription = styledPart(
	DialogDescription,
	"sheet-description",
	"cn-sheet-description"
);
