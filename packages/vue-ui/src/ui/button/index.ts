import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
	"cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "cn-button-variant-default",
				outline: "cn-button-variant-outline",
				secondary: "cn-button-variant-secondary",
				ghost: "cn-button-variant-ghost",
				destructive: "cn-button-variant-destructive",
				link: "cn-button-variant-link",
			},
			size: {
				default: "cn-button-size-default",
				xs: "cn-button-size-xs",
				sm: "cn-button-size-sm",
				lg: "cn-button-size-lg",
				icon: "cn-button-size-icon",
				"icon-xs": "cn-button-size-icon-xs",
				"icon-sm": "cn-button-size-icon-sm",
				"icon-lg": "cn-button-size-icon-lg",
			},
			shape: {
				auto: "",
				pill: "not-in-data-[slot=button-group]:rounded-full",
				square: "",
			},
		},
		compoundVariants: [
			{
				size: ["icon", "icon-xs", "icon-sm", "icon-lg"],
				shape: "auto",
				class: "not-in-data-[slot=button-group]:rounded-full",
			},
		],
		defaultVariants: {
			variant: "default",
			size: "default",
			shape: "auto",
		},
	}
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;
