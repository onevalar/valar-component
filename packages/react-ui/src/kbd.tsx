import { cn } from "cn";
import React, { type ComponentProps } from "react";

export function Kbd({
	className,
	appearance = "default",
	...props
}: ComponentProps<"kbd"> & { appearance?: "default" | "inline" | "compact" }) {
	return (
		<kbd
			data-slot="kbd"
			data-appearance={appearance}
			className={cn(
				"cn-kbd pointer-events-none inline-flex items-center justify-center select-none",
				className
			)}
			{...props}
		/>
	);
}

export function KbdGroup({ className, ...props }: ComponentProps<"kbd">) {
	return (
		<kbd
			data-slot="kbd-group"
			className={cn("cn-kbd-group inline-flex items-center", className)}
			{...props}
		/>
	);
}
