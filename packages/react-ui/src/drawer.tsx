"use client";

import { cn } from "cn";
import { Drawer as Primitive } from "vaul";
import type { ComponentProps } from "react";

export type DrawerProps = ComponentProps<typeof Primitive.Root>;

export function Drawer({ shouldScaleBackground = true, autoFocus = true, ...props }: DrawerProps) {
	return (
		<Primitive.Root
			shouldScaleBackground={shouldScaleBackground}
			autoFocus={autoFocus}
			{...props}
		/>
	);
}

export function DrawerNestedRoot({
	shouldScaleBackground = true,
	autoFocus = true,
	...props
}: ComponentProps<typeof Primitive.NestedRoot>) {
	return (
		<Primitive.NestedRoot
			shouldScaleBackground={shouldScaleBackground}
			autoFocus={autoFocus}
			{...props}
		/>
	);
}

export const DrawerPortal = Primitive.Portal;

export function DrawerTrigger(props: ComponentProps<typeof Primitive.Trigger>) {
	return <Primitive.Trigger data-slot="drawer-trigger" {...props} />;
}

export function DrawerClose(props: ComponentProps<typeof Primitive.Close>) {
	return <Primitive.Close data-slot="drawer-close" {...props} />;
}

export function DrawerOverlay({ className, ...props }: ComponentProps<typeof Primitive.Overlay>) {
	return (
		<Primitive.Overlay
			data-slot="drawer-overlay"
			className={cn(
				"cn-drawer-overlay fixed inset-0 z-50 motion-reduce:animate-none! motion-reduce:transition-none!",
				className
			)}
			{...props}
		/>
	);
}

export type DrawerContentProps = Omit<ComponentProps<typeof Primitive.Content>, "asChild"> & {
	portalProps?: Omit<ComponentProps<typeof DrawerPortal>, "children">;
};

export function DrawerContent({ className, portalProps, children, ...props }: DrawerContentProps) {
	return (
		<DrawerPortal {...portalProps}>
			<DrawerOverlay />
			<Primitive.Content
				data-slot="drawer-content"
				className={cn(
					"cn-drawer-content group/drawer-content fixed z-50 min-h-0 outline-hidden motion-reduce:animate-none! motion-reduce:transition-none!",
					"data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh]",
					"data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh]",
					"data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm",
					"data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm",
					className
				)}
				{...props}
			>
				<div
					aria-hidden="true"
					data-slot="drawer-handle"
					className="cn-drawer-handle mx-auto hidden shrink-0 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
				/>
				{children}
			</Primitive.Content>
		</DrawerPortal>
	);
}

export function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			className={cn(
				"cn-drawer-header flex flex-col group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center",
				className
			)}
			{...props}
		/>
	);
}

export function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-footer"
			className={cn("cn-drawer-footer mt-auto flex flex-col", className)}
			{...props}
		/>
	);
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof Primitive.Title>) {
	return (
		<Primitive.Title
			data-slot="drawer-title"
			className={cn("cn-font-heading cn-drawer-title", className)}
			{...props}
		/>
	);
}

export function DrawerDescription({
	className,
	...props
}: ComponentProps<typeof Primitive.Description>) {
	return (
		<Primitive.Description
			data-slot="drawer-description"
			className={cn("cn-drawer-description", className)}
			{...props}
		/>
	);
}
