"use client";

import * as React from "react";
import { cn } from "cn";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

export type ScrollAreaProps = Omit<
	React.ComponentProps<typeof ScrollAreaPrimitive.Root>,
	"asChild"
> & {
	appearance?: "default" | "settings";
	orientation?: "vertical" | "horizontal" | "both";
	overscroll?: "auto" | "contain";
	viewportLabel?: string;
	viewportRef?: React.Ref<HTMLDivElement>;
	scrollbarXClasses?: string;
	scrollbarYClasses?: string;
};

export function ScrollArea({
	appearance = "default",
	orientation = "vertical",
	overscroll = "auto",
	type = appearance === "settings" ? "auto" : undefined,
	viewportLabel,
	viewportRef,
	scrollbarXClasses,
	scrollbarYClasses,
	className,
	children,
	...props
}: ScrollAreaProps) {
	const settingsBar = appearance === "settings" && "cn-scroll-area-scrollbar-settings";
	return (
		<ScrollAreaPrimitive.Root
			data-slot="scroll-area"
			data-appearance={appearance}
			type={type}
			className={cn("cn-scroll-area relative min-h-0 min-w-0", className)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport
				ref={viewportRef}
				data-slot="scroll-area-viewport"
				role={viewportLabel ? "region" : undefined}
				aria-label={viewportLabel}
				tabIndex={viewportLabel ? 0 : undefined}
				className={cn(
					"cn-scroll-area-viewport size-full max-h-[inherit] rounded-[inherit] outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid",
					overscroll === "contain" && "overscroll-contain"
				)}
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			{orientation !== "horizontal" && (
				<ScrollAreaScrollbar
					orientation="vertical"
					className={cn(settingsBar, scrollbarYClasses)}
				/>
			)}
			{orientation !== "vertical" && (
				<ScrollAreaScrollbar
					orientation="horizontal"
					className={cn(settingsBar, scrollbarXClasses)}
				/>
			)}
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	);
}

export type ScrollAreaScrollbarProps = Omit<
	React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>,
	"asChild"
>;

export function ScrollAreaScrollbar({
	orientation = "vertical",
	className,
	children,
	...props
}: ScrollAreaScrollbarProps) {
	return (
		<ScrollAreaPrimitive.Scrollbar
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
				"cn-scroll-area-scrollbar flex touch-none p-px transition-colors select-none",
				className
			)}
			{...props}
		>
			{children}
			<ScrollAreaPrimitive.Thumb
				data-slot="scroll-area-thumb"
				className="cn-scroll-area-thumb relative flex-1 bg-border"
			/>
		</ScrollAreaPrimitive.Scrollbar>
	);
}
