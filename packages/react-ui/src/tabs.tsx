"use client";

import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Tabs as TabsPrimitive } from "radix-ui";
import React, { createContext, useContext, useState, type ComponentProps } from "react";

export type TabsListVariant = "default" | "line" | "capsule";

export const tabsListVariants = cva(
	"cn-tabs-list group/tabs-list inline-flex w-fit max-w-full items-center justify-center-safe text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-horizontal:scrollbar-none data-horizontal:overflow-x-auto",
	{
		variants: {
			variant: {
				default: "cn-tabs-list-variant-default",
				line: "cn-tabs-list-variant-line gap-1 bg-transparent",
				capsule: "cn-tabs-list-variant-capsule group-data-horizontal/tabs:w-full",
			},
		},
		defaultVariants: { variant: "default" },
	}
);

const TabsContext = createContext({ disabled: false, loop: true, value: "" });

export function Tabs({
	className,
	disabled = false,
	loop = true,
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	...props
}: ComponentProps<typeof TabsPrimitive.Root> & { disabled?: boolean; loop?: boolean }) {
	const [localValue, setLocalValue] = useState(defaultValue);
	const value = controlledValue ?? localValue;
	return (
		<TabsContext.Provider value={{ disabled, loop, value }}>
			<TabsPrimitive.Root
				data-slot="tabs"
				data-disabled={disabled || undefined}
				className={cn("cn-tabs group/tabs flex min-w-0 data-horizontal:flex-col", className)}
				value={value}
				onValueChange={(next) => {
					if (disabled || next === value) return;
					if (controlledValue === undefined) setLocalValue(next);
					onValueChange?.(next);
				}}
				{...props}
			/>
		</TabsContext.Provider>
	);
}

export function TabsList({
	className,
	variant = "default",
	loop,
	onFocus,
	...props
}: ComponentProps<typeof TabsPrimitive.List> & { variant?: TabsListVariant }) {
	const root = useContext(TabsContext);
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			data-variant={variant}
			loop={loop ?? root.loop}
			className={cn(tabsListVariants({ variant }), className)}
			onFocus={(event) => {
				onFocus?.(event);
				const list = event.currentTarget;
				const tab = event.target;
				if (
					event.defaultPrevented ||
					list.dataset.orientation !== "horizontal" ||
					list.scrollWidth <= list.clientWidth ||
					tab.dataset.slot !== "tabs-trigger" ||
					tab.closest("[data-slot=tabs-list]") !== list
				)
					return;
				const start = list.getBoundingClientRect().left + list.clientLeft;
				const end = start + list.clientWidth;
				const bounds = tab.getBoundingClientRect();
				if (bounds.left < start) list.scrollBy({ left: bounds.left - start, behavior: "instant" });
				else if (bounds.right > end)
					list.scrollBy({ left: bounds.right - end, behavior: "instant" });
			}}
			{...props}
		/>
	);
}

export function TabsTrigger({
	className,
	disabled,
	...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
	const root = useContext(TabsContext);
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			disabled={root.disabled || disabled}
			className={cn(
				"cn-tabs-trigger relative inline-flex flex-1 items-center justify-center whitespace-nowrap text-foreground/60 transition-[border-color,background-color,color,opacity,box-shadow] group-data-horizontal/tabs:h-full group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:group-not-data-[variant=capsule]/tabs-list:text-muted-foreground dark:group-not-data-[variant=capsule]/tabs-list:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
				"group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
				"data-active:bg-background data-active:text-foreground dark:group-not-data-[variant=capsule]/tabs-list:data-active:border-input dark:group-not-data-[variant=capsule]/tabs-list:data-active:bg-input/30 dark:group-not-data-[variant=capsule]/tabs-list:data-active:text-foreground",
				"after:pointer-events-none after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:end-0 group-data-vertical/tabs:after:w-0.5 motion-reduce:after:transition-none group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
				"cn-tabs-trigger-capsule",
				className
			)}
			{...props}
		/>
	);
}

export function TabsContent({
	className,
	value,
	forceMount = true,
	hidden,
	...props
}: Omit<ComponentProps<typeof TabsPrimitive.Content>, "forceMount"> & { forceMount?: boolean }) {
	const root = useContext(TabsContext);
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("cn-tabs-content min-w-0 flex-1 outline-none", className)}
			value={value}
			forceMount={forceMount || undefined}
			// Keep inactive children mounted, but out of the accessibility tree and tab order.
			hidden={value !== root.value || hidden}
			{...props}
		/>
	);
}
