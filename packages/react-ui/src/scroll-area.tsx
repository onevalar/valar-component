"use client";

import * as React from "react";
import {
	ScrollArea as SdkScrollArea,
	ScrollAreaContent,
	ScrollAreaCorner,
	ScrollAreaScrollbar as SdkScrollbar,
	ScrollAreaThumb,
	ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area";
import { cn } from "cn";
import type { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

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
		<SdkScrollArea
			data-slot="scroll-area"
			data-appearance={appearance}
			type={type}
			className={cn("cn-scroll-area relative min-h-0 min-w-0", className)}
			{...props}
		>
			<ScrollAreaViewport
				ref={viewportRef}
				data-slot="scroll-area-viewport"
				role={viewportLabel ? "region" : undefined}
				aria-label={viewportLabel}
				tabIndex={viewportLabel ? 0 : undefined}
				className={cn(
					"cn-scroll-area-viewport size-full max-h-[inherit] rounded-[inherit] outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid",
					orientation === "vertical" && "overflow-x-hidden!",
					orientation === "horizontal" && "overflow-y-hidden!",
					overscroll === "contain" && "overscroll-contain"
				)}
			>
				<ScrollAreaContent>{children}</ScrollAreaContent>
			</ScrollAreaViewport>
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
			<ScrollAreaCorner />
		</SdkScrollArea>
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
	forceMount,
	...props
}: ScrollAreaScrollbarProps) {
	return (
		<SdkScrollbar
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			data-vertical={orientation === "vertical" ? "" : undefined}
			data-horizontal={orientation === "horizontal" ? "" : undefined}
			className={cn(
				"cn-scroll-area-scrollbar flex touch-none p-px opacity-0 transition-[color,opacity] select-none data-visible:opacity-100 motion-reduce:transition-none data-horizontal:h-2.5 data-vertical:w-2.5",
				orientation === "vertical" && "h-auto!",
				forceMount && "flex!",
				className
			)}
			{...props}
		>
			{children}
			<ScrollAreaThumb
				data-slot="scroll-area-thumb"
				className={cn(
					"cn-scroll-area-thumb relative shrink-0 bg-border",
					orientation === "vertical" ? "w-full" : "h-full"
				)}
			/>
		</SdkScrollbar>
	);
}
