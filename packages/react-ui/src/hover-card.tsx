"use client";

import * as React from "react";
import { cn } from "cn";
import { HoverCard as Primitive } from "radix-ui";

export const HoverCard = Primitive.Root;
export const HoverCardPortal = Primitive.Portal;

export function HoverCardTrigger({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Trigger>) {
	return (
		<Primitive.Trigger
			data-slot="hover-card-trigger"
			className={cn(
				"focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring",
				className
			)}
			{...props}
		/>
	);
}

export type HoverCardContentProps = React.ComponentProps<typeof Primitive.Content> & {
	appearance?: "default" | "profile";
	portalProps?: false | Omit<React.ComponentProps<typeof HoverCardPortal>, "children">;
};

export function HoverCardContent({
	className,
	appearance = "default",
	side = "bottom",
	sideOffset = 4,
	align = "center",
	collisionPadding = 8,
	portalProps,
	forceMount,
	...props
}: HoverCardContentProps) {
	const content = (
		<Primitive.Content
			data-slot="hover-card-content"
			data-appearance={appearance}
			side={side}
			sideOffset={sideOffset}
			align={align}
			collisionPadding={collisionPadding}
			forceMount={forceMount}
			className={cn(
				"cn-hover-card-content z-50 origin-(--radix-hover-card-content-transform-origin) outline-hidden [--bits-link-preview-content-available-height:var(--radix-hover-card-content-available-height)] [--bits-link-preview-content-available-width:var(--radix-hover-card-content-available-width)]",
				appearance === "profile" && "cn-hover-card-profile",
				className
			)}
			{...props}
		/>
	);
	return portalProps === false ? (
		content
	) : (
		<HoverCardPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</HoverCardPortal>
	);
}
