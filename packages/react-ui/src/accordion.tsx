"use client";

import * as React from "react";
import {
	Accordion as SdkRoot,
	AccordionHeader as SdkHeader,
	AccordionItem as SdkItem,
	AccordionPanel as SdkPanel,
	AccordionTrigger as SdkTrigger,
} from "@ui-sdk/react/accordion";
import { cn } from "cn";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Direction, Slot } from "radix-ui";

type Orientation = "horizontal" | "vertical";
const OrientationContext = React.createContext<Orientation>("vertical");

type ValueProps<T> = { value?: T; defaultValue?: T; onValueChange?: (value: T) => void };
export type AccordionProps = React.ComponentPropsWithRef<"div"> & {
	asChild?: boolean;
	dir?: "ltr" | "rtl";
	disabled?: boolean;
	loop?: boolean;
	orientation?: Orientation;
} & (
		| ({ type: "single"; collapsible?: boolean } & ValueProps<string>)
		| ({ type: "multiple"; collapsible?: never } & ValueProps<string[]>)
	);

export function Accordion({
	className,
	dir,
	loop = true,
	onKeyDown,
	orientation = "vertical",
	asChild,
	type,
	value,
	defaultValue,
	onValueChange,
	collapsible = true,
	...props
}: AccordionProps) {
	const direction = Direction.useDirection(dir);
	const Element = asChild ? Slot.Root : "div";
	const values = (value: string | string[] | undefined) =>
		value === undefined ? undefined : Array.isArray(value) ? value : value === "" ? [] : [value];
	// The SDK follows the current APG and omits arrow navigation. Keep Valar's opt-in/out looping contract.
	function navigate(event: React.KeyboardEvent<HTMLDivElement>) {
		onKeyDown?.(event);
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
			return;
		const root = event.currentTarget;
		const target = event.target;
		if (!(target instanceof HTMLElement) || target.closest('[data-slot="accordion"]') !== root)
			return;
		const next =
			orientation === "vertical" ? "ArrowDown" : direction === "rtl" ? "ArrowLeft" : "ArrowRight";
		const previous =
			orientation === "vertical" ? "ArrowUp" : direction === "rtl" ? "ArrowRight" : "ArrowLeft";
		if (![previous, next, "Home", "End"].includes(event.key)) return;
		const triggers = [
			...root.querySelectorAll<HTMLElement>(
				'[data-slot="accordion-trigger"]:not(:disabled):not([data-disabled])'
			),
		].filter((trigger) => trigger.closest('[data-slot="accordion"]') === root);
		const index = triggers.indexOf(target);
		if (index < 0) return;
		event.preventDefault();
		let destination =
			event.key === "Home"
				? 0
				: event.key === "End"
					? triggers.length - 1
					: index + (event.key === next ? 1 : -1);
		if (loop) destination = (destination + triggers.length) % triggers.length;
		triggers[destination]?.focus();
	}
	return (
		<OrientationContext.Provider value={orientation}>
			<SdkRoot
				data-slot="accordion"
				data-orientation={orientation}
				dir={direction}
				className={cn("cn-accordion flex w-full flex-col", className)}
				{...props}
				multiple={type === "multiple"}
				collapsible={collapsible}
				value={values(value)}
				defaultValue={values(defaultValue)}
				onValueChange={(next) => {
					if (type === "multiple") onValueChange?.(next);
					else onValueChange?.(next[0] ?? "");
				}}
				onKeyDown={navigate}
				render={(attrs) => <Element {...attrs} />}
			/>
		</OrientationContext.Provider>
	);
}

export type AccordionItemProps = React.ComponentPropsWithRef<"div"> & {
	asChild?: boolean;
	value: string;
	disabled?: boolean;
};
export function AccordionItem({ className, asChild, ...props }: AccordionItemProps) {
	const orientation = React.useContext(OrientationContext);
	const Element = asChild ? Slot.Root : "div";
	return (
		<SdkItem
			data-slot="accordion-item"
			data-orientation={orientation}
			className={cn("cn-accordion-item", className)}
			{...props}
			render={(attrs, state) => <Element {...attrs} data-state={state.open ? "open" : "closed"} />}
		/>
	);
}

export type AccordionTriggerProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
	level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export function AccordionTrigger({
	className,
	level = 3,
	children,
	asChild,
	value,
	...props
}: AccordionTriggerProps) {
	const orientation = React.useContext(OrientationContext);
	const Heading = `h${level}` as const;
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkHeader
			className="flex"
			data-orientation={orientation}
			render={(attrs, state) => <Heading {...attrs} data-state={state.open ? "open" : "closed"} />}
		>
			<SdkTrigger
				data-slot="accordion-trigger"
				data-orientation={orientation}
				className={cn(
					"cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent text-start outline-none disabled:pointer-events-none disabled:opacity-50",
					className
				)}
				{...props}
				render={(attrs, state) => (
					<Element
						{...attrs}
						value={value}
						disabled={state.disabled}
						data-state={state.open ? "open" : "closed"}
					/>
				)}
			>
				<Slot.Slottable>{children}</Slot.Slottable>
				<ChevronDown
					aria-hidden="true"
					data-slot="accordion-trigger-icon"
					className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
				/>
				<ChevronUp
					aria-hidden="true"
					data-slot="accordion-trigger-icon"
					className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
				/>
			</SdkTrigger>
		</SdkHeader>
	);
}

export type AccordionContentProps = React.ComponentPropsWithRef<"div"> & { forceMount?: true };
export function AccordionContent({
	className,
	children,
	forceMount,
	style,
	...props
}: AccordionContentProps) {
	const orientation = React.useContext(OrientationContext);
	return (
		<SdkPanel
			data-slot="accordion-content"
			data-orientation={orientation}
			keepMounted
			className="cn-accordion-content overflow-hidden motion-reduce:animate-none!"
			style={
				{
					"--radix-accordion-content-height": "var(--accordion-panel-height)",
					"--radix-accordion-content-width": "var(--accordion-panel-width)",
					...style,
				} as React.CSSProperties
			}
			{...props}
			render={(attrs, state) => (
				<div
					{...attrs}
					data-slot="accordion-content"
					hidden={forceMount ? props.hidden : attrs.hidden}
					data-state={state.open ? "open" : "closed"}
				>
					{(forceMount || !attrs.hidden) && (
						<div
							className={cn(
								"cn-accordion-content-inner [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
								className
							)}
						>
							{children}
						</div>
					)}
				</div>
			)}
		/>
	);
}
