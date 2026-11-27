import { DialogDescription, DialogTitle, DialogTrigger, Primitive } from "reka-ui";
import AlertDialogOverlay from "./AlertDialogOverlay.vue";
import { styledPart } from "../dropdown-menu/parts.js";

export { AlertDialogOverlay };
export { default as AlertDialogCancel } from "./AlertDialogCancel.vue";
export const AlertDialogTrigger = styledPart(DialogTrigger, "alert-dialog-trigger");
export const AlertDialogTitle = styledPart(
	DialogTitle,
	"alert-dialog-title",
	"cn-font-heading cn-alert-dialog-title"
);
export const AlertDialogDescription = styledPart(
	DialogDescription,
	"alert-dialog-description",
	"cn-alert-dialog-description"
);
export const AlertDialogHeader = styledPart(
	Primitive,
	"alert-dialog-header",
	"cn-alert-dialog-header"
);
export const AlertDialogMedia = styledPart(
	Primitive,
	"alert-dialog-media",
	"cn-alert-dialog-media"
);
export const AlertDialogFooter = styledPart(
	Primitive,
	"alert-dialog-footer",
	"cn-alert-dialog-footer flex flex-wrap justify-end gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2"
);
