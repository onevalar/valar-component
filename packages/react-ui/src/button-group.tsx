import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";
import React, { type ComponentProps } from "react";
import { Separator } from "./separator.tsx";

export type ButtonGroupVariant = "default" | "pill";
export type ButtonGroupOrientation = "horizontal" | "vertical";

export const buttonGroupVariants = cva(
	"cn-button-group group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
	{
		variants: {
			variant: { default: "", pill: "" },
			orientation: {
				horizontal:
					"cn-button-group-orientation-horizontal [&>*:not(:first-child)]:rounded-s-none [&>*:not(:first-child)]:border-s-0 [&>*:not(:last-child)]:rounded-e-none rtl:[&>[data-slot]:not(:has(~[data-slot]))]:rounded-l-lg! rtl:[&>[data-slot]:not(:has(~[data-slot])):not(:first-child)]:rounded-r-none!",
				vertical:
					"cn-button-group-orientation-vertical flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
			},
		},
		compoundVariants: [
			{
				variant: "pill",
				orientation: "horizontal",
				class:
					"cn-button-group-variant-pill rtl:[&[data-variant=pill]>:is(button,a):first-child]:rounded-r-full! rtl:[&[data-variant=pill]>:is(button,a):first-child:not(:last-child)]:rounded-l-none! rtl:[&[data-variant=pill]>:is(button,a):last-child]:rounded-l-full! rtl:[&[data-variant=pill]>:is(button,a):last-child:not(:first-child)]:rounded-r-none!",
			},
		],
		defaultVariants: { variant: "default", orientation: "horizontal" },
	}
);

export function ButtonGroup({
	className,
	variant = "default",
	orientation = "horizontal",
	...props
}: ComponentProps<"div"> & { variant?: ButtonGroupVariant; orientation?: ButtonGroupOrientation }) {
	return (
		<div
			data-slot="button-group"
			data-variant={variant}
			data-orientation={orientation}
			role="group"
			className={cn(buttonGroupVariants({ variant, orientation }), className)}
			{...props}
		/>
	);
}

export function ButtonGroupText({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "div";
	return (
		<Comp
			data-slot="button-group-text"
			className={cn(
				"cn-button-group-text flex items-center [&_svg]:pointer-events-none",
				className
			)}
			{...props}
		/>
	);
}

export function ButtonGroupSeparator({
	className,
	orientation = "vertical",
	decorative = true,
	...props
}: ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="button-group-separator"
			orientation={orientation}
			decorative={decorative}
			className={cn(
				"cn-button-group-separator relative self-stretch data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto",
				className
			)}
			{...props}
		/>
	);
}
