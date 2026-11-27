import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonVariants } from "../button";

export { default as InputGroup } from "./InputGroup.vue";
export { default as InputGroupAddon } from "./InputGroupAddon.vue";
export { default as InputGroupButton } from "./InputGroupButton.vue";
export { default as InputGroupInput } from "./InputGroupInput.vue";
export { default as InputGroupText } from "./InputGroupText.vue";
export { default as InputGroupTextarea } from "./InputGroupTextarea.vue";

export const inputGroupAddonVariants = cva("cn-input-group-addon flex cursor-text items-center justify-center select-none", {
	variants: { align: {
		"inline-start": "cn-input-group-addon-align-inline-start order-first",
		"inline-end": "cn-input-group-addon-align-inline-end order-last",
		"block-start": "cn-input-group-addon-align-block-start order-first w-full justify-start",
		"block-end": "cn-input-group-addon-align-block-end order-last w-full justify-start",
	} },
	defaultVariants: { align: "inline-start" },
});
export type InputGroupAddonAlign = NonNullable<VariantProps<typeof inputGroupAddonVariants>["align"]>;

export const inputGroupButtonVariants = cva("cn-input-group-button flex items-center shadow-none", {
	variants: { size: {
		xs: "cn-input-group-button-size-xs",
		sm: "cn-input-group-button-size-sm",
		"icon-xs": "cn-input-group-button-size-icon-xs",
		"icon-sm": "cn-input-group-button-size-icon-sm",
	} },
	defaultVariants: { size: "xs" },
});
export type InputGroupButtonSize = NonNullable<VariantProps<typeof inputGroupButtonVariants>["size"]>;
export type InputGroupButtonShape = NonNullable<ButtonVariants["shape"]>;
