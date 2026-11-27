"use client";

import { renderElement } from "@ui-sdk/react/primitive";
import { Separator as SdkSeparator } from "@ui-sdk/react/separator";
import { cn } from "cn";
import React, { type ComponentPropsWithRef } from "react";
import type { SeparatorOrientation } from "@ui-sdk/react/separator";

export function Separator({
	className,
	decorative = false,
	asChild,
	children,
	"data-slot": dataSlot = "separator",
	...props
}: ComponentPropsWithRef<"div"> & {
	orientation?: SeparatorOrientation;
	decorative?: boolean;
	asChild?: boolean;
	"data-slot"?: string;
}) {
	if (asChild && !React.isValidElement(children))
		throw new Error("Separator asChild expects a single React element");
	return (
		<SdkSeparator
			decorative={decorative}
			className={cn(
				"shrink-0 bg-[color:var(--valar-separator,var(--valar-separator-base,lch(0%_0_0_/_8.8%)))] data-[orientation=horizontal]:h-[0.5px] data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[0.5px] data-[orientation=vertical]:self-stretch dark:[--valar-separator-base:lch(100%_0_0_/_8.3%)]",
				className
			)}
			{...props}
			render={(slot, state) =>
				renderElement(
					"div",
					{ ...slot, "data-slot": dataSlot },
					asChild && React.isValidElement(children) ? children : undefined,
					state
				)
			}
		>
			{asChild ? undefined : children}
		</SdkSeparator>
	);
}
