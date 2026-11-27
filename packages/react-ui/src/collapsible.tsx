"use client";

import * as React from "react";
import { cn } from "cn";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";

export type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
	appearance?: "default" | "properties";
};

export function Collapsible({ className, appearance = "default", ...props }: CollapsibleProps) {
	return (
		<CollapsiblePrimitive.Root
			data-slot="collapsible"
			data-appearance={appearance}
			className={cn(appearance === "properties" && "cn-collapsible-properties", className)}
			{...props}
		/>
	);
}

export type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsiblePrimitive.Trigger>;

export function CollapsibleTrigger({ className, ...props }: CollapsibleTriggerProps) {
	return (
		<CollapsiblePrimitive.Trigger
			data-slot="collapsible-trigger"
			className={cn("cn-collapsible-trigger", className)}
			{...props}
		/>
	);
}

export type CollapsibleContentProps = Omit<
	React.ComponentProps<typeof CollapsiblePrimitive.Content>,
	"forceMount"
> & {
	forceMount?: boolean;
};

export function CollapsibleContent({
	className,
	forceMount = false,
	...props
}: CollapsibleContentProps) {
	return (
		<CollapsiblePrimitive.Content
			data-slot="collapsible-content"
			forceMount
			className={cn(
				"cn-collapsible-content-geometry",
				!forceMount && "data-closed:hidden",
				className
			)}
			{...props}
		/>
	);
}
