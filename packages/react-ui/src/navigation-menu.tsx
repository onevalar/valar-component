"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import { NavigationMenu as Primitive, Slot } from "radix-ui";

export type NavigationMenuProps = React.ComponentProps<typeof Primitive.Root> & {
	viewport?: boolean;
};

export function NavigationMenu({
	className,
	viewport = true,
	children,
	orientation = "horizontal",
	...props
}: NavigationMenuProps) {
	const viewportElement = viewport && <NavigationMenuViewport />;
	return (
		<Primitive.Root
			data-slot="navigation-menu"
			data-viewport={viewport}
			orientation={orientation}
			className={cn(
				"cn-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
				className
			)}
			{...props}
		>
			<Slot.Slottable>{children}</Slot.Slottable>
			{viewportElement}
		</Primitive.Root>
	);
}

export function NavigationMenuList({
	className,
	...props
}: React.ComponentProps<typeof Primitive.List>) {
	return (
		<Primitive.List
			data-slot="navigation-menu-list"
			className={cn(
				"cn-navigation-menu-list group flex flex-1 list-none items-center justify-center data-[orientation=vertical]:flex-col",
				className
			)}
			{...props}
		/>
	);
}

export function NavigationMenuItem({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Item>) {
	return (
		<Primitive.Item
			data-slot="navigation-menu-item"
			className={cn("relative", className)}
			{...props}
		/>
	);
}

export function navigationMenuTriggerStyle() {
	return "cn-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none";
}

export function NavigationMenuTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof Primitive.Trigger>) {
	return (
		<Primitive.Trigger
			data-slot="navigation-menu-trigger"
			className={cn(navigationMenuTriggerStyle(), className)}
			{...props}
		>
			<Slot.Slottable>{children}</Slot.Slottable>
			<ChevronDownIcon aria-hidden="true" className="cn-navigation-menu-trigger-icon" />
		</Primitive.Trigger>
	);
}

export function NavigationMenuContent({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Content>) {
	return (
		<Primitive.Content
			data-slot="navigation-menu-content"
			className={cn(
				"cn-navigation-menu-content start-0 top-0 w-max max-w-[calc(100dvw-1rem)] group-data-[viewport=false]/navigation-menu:absolute group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:z-50 group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[orientation=vertical]/navigation-menu:group-data-[viewport=false]/navigation-menu:start-full group-data-[orientation=vertical]/navigation-menu:group-data-[viewport=false]/navigation-menu:top-0 md:absolute",
				className
			)}
			{...props}
		/>
	);
}

export function NavigationMenuLink({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Link>) {
	return (
		<Primitive.Link
			data-slot="navigation-menu-link"
			className={cn("cn-navigation-menu-link", className)}
			{...props}
		/>
	);
}

export function NavigationMenuIndicator({
	className,
	children,
	asChild,
	...props
}: React.ComponentProps<typeof Primitive.Indicator>) {
	return (
		<Primitive.Indicator
			data-slot="navigation-menu-indicator"
			className={cn(
				"cn-navigation-menu-indicator top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
				className
			)}
			asChild={asChild}
			{...props}
		>
			{children ??
				(!asChild && (
					<div className="cn-navigation-menu-indicator-arrow relative top-[60%] size-2 rotate-45" />
				))}
		</Primitive.Indicator>
	);
}

export function NavigationMenuViewport({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Viewport>) {
	return (
		<div className="absolute start-0 top-full isolate z-50 flex group-data-[orientation=vertical]/navigation-menu:start-full group-data-[orientation=vertical]/navigation-menu:top-0">
			<Primitive.Viewport
				data-slot="navigation-menu-viewport"
				className={cn(
					"cn-navigation-menu-viewport origin-top-center relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) max-w-[calc(100dvw-1rem)] overflow-hidden",
					className
				)}
				{...props}
			/>
		</div>
	);
}
