import { cn } from "cn";
import { AspectRatio as AspectRatioPrimitive } from "radix-ui";
import React, { type ComponentProps } from "react";

export type AspectRatioProps = ComponentProps<typeof AspectRatioPrimitive.Root>;

export function AspectRatio({ className, ...props }: AspectRatioProps) {
	return (
		<AspectRatioPrimitive.Root
			data-slot="aspect-ratio"
			className={cn("cn-aspect-ratio-geometry", className)}
			{...props}
		/>
	);
}
