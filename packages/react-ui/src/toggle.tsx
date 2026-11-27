"use client";

import { Toggle as SdkToggle } from "@ui-sdk/react/toggle";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";
import React, { type ComponentPropsWithRef } from "react";

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

type ToggleProps = ComponentPropsWithRef<"button"> &
	ToggleVariants & {
		asChild?: boolean;
		pressed?: boolean;
		defaultPressed?: boolean;
		onPressedChange?: (pressed: boolean) => void;
	};

export function Toggle({
	className,
	variant = "default",
	size = "default",
	asChild,
	value,
	onPressedChange,
	...props
}: ToggleProps) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkToggle
			data-slot="toggle"
			data-variant={variant}
			data-size={size}
			className={cn(toggleVariants({ variant, size }), className)}
			{...props}
			onPressedChange={(next) => onPressedChange?.(next)}
			render={(attrs, state) => (
				<Element {...attrs} value={value} data-state={state.pressed ? "on" : "off"} />
			)}
		/>
	);
}
