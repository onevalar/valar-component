"use client";

import * as React from "react";
import { cn } from "cn";
import { Popover as PopoverPrimitive } from "radix-ui";

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

const PopoverPortal = PopoverPrimitive.Portal;

function PopoverContent({
	className,
	align = "center",
	sideOffset = 4,
	collisionPadding = 8,
	appearance = "default",
	portalProps,
	forceMount,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
	appearance?: "default" | "surface" | "options";
	portalProps?: false | Omit<React.ComponentProps<typeof PopoverPortal>, "children">;
}) {
	const content = (
		<PopoverPrimitive.Content
			data-slot="popover-content"
			data-appearance={appearance}
			align={align}
			sideOffset={sideOffset}
			collisionPadding={collisionPadding}
			forceMount={forceMount}
			className={cn(
				"cn-popover-content cn-overlay-surface cn-popover-viewport z-50 origin-(--radix-popover-content-transform-origin) outline-hidden",
				appearance === "options" ? "w-[330px]" : "w-72",
				appearance === "surface" && "cn-overlay-menu-rows animate-none!",
				appearance === "options" && "cn-popover-options animate-none!",
				className
			)}
			{...props}
		/>
	);
	return portalProps === false ? (
		content
	) : (
		<PopoverPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</PopoverPortal>
	);
}

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
	return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
	return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-slot="popover-header" className={cn("cn-popover-header", className)} {...props} />
	);
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="popover-title" className={cn("cn-popover-title", className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="popover-description"
			className={cn("cn-popover-description", className)}
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverAnchor,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverPortal,
	PopoverTitle,
	PopoverTrigger,
};
