import * as Reka from "reka-ui";
import { Dialog, DialogClose, DialogTrigger } from "../dialog/index.js";
import { styledPart } from "../dropdown-menu/parts.js";

export { Dialog as Sheet };
export { DialogPortal as SheetPortal } from "reka-ui";
export { default as SheetContent, type SheetSide } from "./SheetContent.vue";
export { default as SheetPanel } from "./SheetPanel.vue";
export const SheetTrigger = styledPart(DialogTrigger, "sheet-trigger");
export const SheetClose = styledPart(DialogClose, "sheet-close");
export const SheetOverlay = styledPart(
	Reka.DialogOverlay,
	"sheet-overlay",
	"cn-sheet-overlay fixed inset-0 z-50 duration-100 motion-reduce:animate-none! data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
);
export const SheetHeader = styledPart(
	Reka.Primitive,
	"sheet-header",
	"cn-sheet-header flex flex-col"
);
export const SheetFooter = styledPart(
	Reka.Primitive,
	"sheet-footer",
	"cn-sheet-footer mt-auto flex flex-col"
);
export const SheetTitle = styledPart(
	Reka.DialogTitle,
	"sheet-title",
	"cn-font-heading cn-sheet-title"
);
export const SheetDescription = styledPart(
	Reka.DialogDescription,
	"sheet-description",
	"cn-sheet-description"
);
