import { cn } from "cn";
import { Separator as SeparatorPrimitive } from "radix-ui";
import React, { type ComponentProps } from "react";

export function Separator({
	className,
	decorative = false,
	...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			className={cn(
				"shrink-0 bg-[color:var(--valar-separator,var(--valar-separator-base,lch(0%_0_0_/_8.8%)))] data-[orientation=horizontal]:h-[0.5px] data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[0.5px] data-[orientation=vertical]:self-stretch dark:[--valar-separator-base:lch(100%_0_0_/_8.3%)]",
				className
			)}
			{...props}
		/>
	);
}
