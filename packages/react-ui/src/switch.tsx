"use client";

import { cn } from "cn";
import { Switch as SwitchPrimitive } from "radix-ui";
import React, { type ComponentProps } from "react";

export type SwitchProps = Omit<
	ComponentProps<typeof SwitchPrimitive.Root>,
	"children" | "asChild"
> & {
	size?: "default" | "sm";
	appearance?: "default" | "settings";
};

export function Switch({
	className,
	size = "default",
	appearance = "default",
	...props
}: SwitchProps) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			data-size={size}
			data-appearance={appearance}
			className={cn(
				"cn-switch peer group/switch relative inline-flex items-center transition-[background-color,opacity] duration-150 ease-out outline-none after:absolute after:-inset-x-3 after:-inset-y-2 motion-reduce:transition-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
				className
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className="cn-switch-thumb cn-switch-thumb-motion pointer-events-none block shrink-0 ring-0 duration-100 ease-out motion-reduce:transition-none"
			/>
		</SwitchPrimitive.Root>
	);
}
