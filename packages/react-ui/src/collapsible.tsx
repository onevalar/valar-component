"use client";

import {
	Collapsible as SdkRoot,
	CollapsiblePanel as SdkPanel,
	CollapsibleTrigger as SdkTrigger,
} from "@ui-sdk/react/collapsible";
import { cn } from "cn";
import { Slot } from "radix-ui";
import type { ComponentPropsWithRef, CSSProperties } from "react";

export type CollapsibleProps = ComponentPropsWithRef<"div"> & {
	appearance?: "default" | "properties";
	asChild?: boolean;
	disabled?: boolean;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function Collapsible({
	className,
	appearance = "default",
	asChild,
	onOpenChange,
	...props
}: CollapsibleProps) {
	const Element = asChild ? Slot.Root : "div";
	return (
		<SdkRoot
			data-slot="collapsible"
			data-appearance={appearance}
			className={cn(appearance === "properties" && "cn-collapsible-properties", className)}
			{...props}
			onOpenChange={(open) => onOpenChange?.(open)}
			render={(attrs, state) => <Element {...attrs} data-state={state.open ? "open" : "closed"} />}
		/>
	);
}

export type CollapsibleTriggerProps = ComponentPropsWithRef<"button"> & { asChild?: boolean };

export function CollapsibleTrigger({
	className,
	asChild,
	disabled,
	...props
}: CollapsibleTriggerProps) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkTrigger
			data-slot="collapsible-trigger"
			className={cn("cn-collapsible-trigger", className)}
			{...props}
			render={(attrs, state) => (
				<Element
					{...attrs}
					disabled={disabled || state.disabled}
					data-state={state.open ? "open" : "closed"}
				/>
			)}
		/>
	);
}

export type CollapsibleContentProps = ComponentPropsWithRef<"div"> & {
	asChild?: boolean;
	forceMount?: boolean;
};

export function CollapsibleContent({
	className,
	forceMount = false,
	asChild,
	style,
	...props
}: CollapsibleContentProps) {
	const Element = asChild ? Slot.Root : "div";
	return (
		<SdkPanel
			data-slot="collapsible-content"
			keepMounted
			className={cn(
				"cn-collapsible-content-geometry",
				!forceMount && "data-closed:hidden",
				className
			)}
			style={
				{
					"--radix-collapsible-content-height": "var(--collapsible-panel-height)",
					"--radix-collapsible-content-width": "var(--collapsible-panel-width)",
					...style,
				} as CSSProperties
			}
			{...props}
			render={(attrs, state) => (
				<Element
					{...attrs}
					data-slot="collapsible-content"
					hidden={forceMount ? props.hidden : attrs.hidden}
					data-state={state.open ? "open" : "closed"}
				/>
			)}
		/>
	);
}
