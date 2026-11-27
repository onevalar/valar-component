import { cva, type VariantProps } from "class-variance-authority";

export { default as Field } from "./Field.vue";
export { default as FieldContent } from "./FieldContent.vue";
export { default as FieldDescription } from "./FieldDescription.vue";
export { default as FieldError } from "./FieldError.vue";
export { default as FieldGroup } from "./FieldGroup.vue";
export { default as FieldLabel } from "./FieldLabel.vue";
export { default as FieldLegend } from "./FieldLegend.vue";
export { default as FieldSeparator } from "./FieldSeparator.vue";
export { default as FieldSet } from "./FieldSet.vue";
export { default as FieldTitle } from "./FieldTitle.vue";

export const fieldVariants = cva("cn-field group/field flex w-full", {
	variants: {
		appearance: { default: "", settings: "cn-field-appearance-settings" },
		orientation: {
			vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
			horizontal: "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
			responsive: "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
		},
	},
	compoundVariants: [
		{ appearance: "settings", orientation: "horizontal", class: "has-[>[data-slot=field-content]]:items-center" },
		{ appearance: "settings", orientation: "responsive", class: "@md/field-group:has-[>[data-slot=field-content]]:items-center" },
	],
	defaultVariants: { appearance: "default", orientation: "vertical" },
});

export type FieldAppearance = NonNullable<VariantProps<typeof fieldVariants>["appearance"]>;
export type FieldOrientation = NonNullable<VariantProps<typeof fieldVariants>["orientation"]>;
