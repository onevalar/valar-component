"use client";

import {
	Tabs as SdkTabs,
	TabsList as SdkList,
	TabsPanel as SdkPanel,
	TabsTab as SdkTab,
} from "@ui-sdk/react/tabs";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Direction, Slot } from "radix-ui";
import React, {
	createContext,
	useContext,
	useId,
	useLayoutEffect,
	useState,
	type ComponentPropsWithRef,
} from "react";

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

const TabsContext = createContext<{
	disabled: boolean;
	baseId: string;
	setListLoop?: (loop: boolean | undefined) => void;
}>({ disabled: false, baseId: "" });
type DivProps = ComponentPropsWithRef<"div"> & { asChild?: boolean };

// Valar exposes both ARIA references in SSR; the SDK only wires controls after mounting.
function tabsIds(baseId: string, value: string) {
	const suffix = value.replace(/[\s%]/g, encodeURIComponent);
	return { tab: `${baseId}-tab-${suffix}`, panel: `${baseId}-panel-${suffix}` };
}

export function Tabs({
	className,
	disabled = false,
	loop = true,
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	activationMode,
	asChild,
	dir,
	...props
}: DivProps & {
	disabled?: boolean;
	loop?: boolean;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	activationMode?: "automatic" | "manual";
	orientation?: "horizontal" | "vertical";
	dir?: "ltr" | "rtl";
}) {
	const [localValue, setLocalValue] = useState(defaultValue);
	const [listLoop, setListLoop] = useState<boolean>();
	const value = controlledValue ?? localValue;
	const baseId = useId();
	const direction = Direction.useDirection(dir);
	const Element = asChild ? Slot.Root : "div";
	return (
		<TabsContext.Provider value={{ disabled, baseId, setListLoop }}>
			<SdkTabs
				data-disabled={disabled ? "" : undefined}
				className={cn("cn-tabs group/tabs flex min-w-0 data-horizontal:flex-col", className)}
				value={value || null}
				dir={direction}
				loop={listLoop ?? loop}
				activation={activationMode}
				onValueChange={(next) => {
					const selected = next ?? "";
					if (disabled || selected === value) return;
					if (controlledValue === undefined) setLocalValue(selected);
					onValueChange?.(selected);
				}}
				{...props}
				render={(attrs) => <Element {...attrs} data-slot="tabs" />}
			/>
		</TabsContext.Provider>
	);
}

export function TabsList({
	className,
	variant = "default",
	loop,
	onFocus,
	asChild,
	...props
}: DivProps & { variant?: TabsListVariant; loop?: boolean }) {
	const Element = asChild ? Slot.Root : "div";
	const { setListLoop } = useContext(TabsContext);
	useLayoutEffect(() => {
		if (loop === undefined) return;
		setListLoop?.(loop);
		return () => setListLoop?.(undefined);
	}, [loop, setListLoop]);
	return (
		<SdkList
			data-variant={variant}
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
			render={(attrs) => <Element {...attrs} data-slot="tabs-list" />}
		/>
	);
}

export function TabsTrigger({
	className,
	disabled,
	asChild,
	value,
	ref,
	...props
}: ComponentPropsWithRef<"button"> & { value: string; asChild?: boolean }) {
	const context = useContext(TabsContext);
	const isDisabled = Boolean(context.disabled || disabled);
	const ids = tabsIds(context.baseId, value);
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkTab
			value={value}
			disabled={isDisabled}
			ref={isDisabled ? undefined : ref}
			className={cn(
				"cn-tabs-trigger relative inline-flex flex-1 items-center justify-center whitespace-nowrap text-foreground/60 transition-[border-color,background-color,color,opacity,box-shadow] group-data-horizontal/tabs:h-full group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:group-not-data-[variant=capsule]/tabs-list:text-muted-foreground dark:group-not-data-[variant=capsule]/tabs-list:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
				"group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
				"data-active:bg-background data-active:text-foreground dark:group-not-data-[variant=capsule]/tabs-list:data-active:border-input dark:group-not-data-[variant=capsule]/tabs-list:data-active:bg-input/30 dark:group-not-data-[variant=capsule]/tabs-list:data-active:text-foreground",
				"after:pointer-events-none after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:end-0 group-data-vertical/tabs:after:w-0.5 motion-reduce:after:transition-none group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
				"cn-tabs-trigger-capsule",
				className
			)}
			{...props}
			render={(attrs, { selected }) => (
				<Element
					{...attrs}
					id={props.id ?? ids.tab}
					aria-controls={props["aria-controls"] ?? ids.panel}
					ref={isDisabled ? ref : attrs.ref}
					data-slot="tabs-trigger"
					disabled={isDisabled}
					data-active={selected ? "" : undefined}
					data-state={selected ? "active" : "inactive"}
				/>
			)}
		/>
	);
}

export function TabsContent({
	className,
	value,
	forceMount = true,
	hidden,
	asChild,
	...props
}: DivProps & { value: string; forceMount?: boolean }) {
	const Element = asChild ? Slot.Root : "div";
	const { baseId } = useContext(TabsContext);
	const ids = tabsIds(baseId, value);
	return (
		<SdkPanel
			className={cn("cn-tabs-content min-w-0 flex-1 outline-none", className)}
			value={value}
			keepMounted={forceMount}
			tabIndex={0}
			{...props}
			render={(attrs, { selected }) => (
				<Element
					{...attrs}
					id={props.id ?? ids.panel}
					aria-labelledby={props["aria-labelledby"] ?? ids.tab}
					data-slot="tabs-content"
					data-state={selected ? "active" : "inactive"}
					hidden={!selected || hidden}
				/>
			)}
		/>
	);
}
