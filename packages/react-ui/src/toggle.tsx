"use client";

import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Toggle as TogglePrimitive } from "radix-ui";
import React, { type ComponentProps } from "react";

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "default" | "sm" | "lg";
export type ToggleVariants = { variant?: ToggleVariant; size?: ToggleSize };

export const toggleVariants = cva(
	"cn-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: { default: "cn-toggle-variant-default", outline: "cn-toggle-variant-outline" },
			size: {
				default: "cn-toggle-size-default",
				sm: "cn-toggle-size-sm",
				lg: "cn-toggle-size-lg",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	}
);

export function Toggle({
	className,
	variant = "default",
	size = "default",
	...props
}: ComponentProps<typeof TogglePrimitive.Root> & ToggleVariants) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			data-variant={variant}
			data-size={size}
			className={cn(toggleVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
