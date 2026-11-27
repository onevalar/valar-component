// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
"use client";

import { cn } from "cn";
import { ChevronRight } from "lucide-react";
import { CollapsiblePanel as SdkPanel } from "@ui-sdk/react/collapsible";
import React, { type ComponentProps } from "react";
import {
	Collapsible,
	CollapsibleTrigger,
	type CollapsibleContentProps,
	type CollapsibleProps,
	type CollapsibleTriggerProps,
} from "./collapsible.tsx";

export function Trace({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="trace"
			className={cn(
				"cn-trace flex w-full min-w-0 flex-col *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:text-start *:has-[>[data-slot=trace-line]]:outline-none",
				className
			)}
			{...props}
		/>
	);
}

export type TraceLineStatus = "running" | "error" | "pending";
export type TraceLineProps = ComponentProps<"span"> & { status?: TraceLineStatus };
export function TraceLine({ className, status, ...props }: TraceLineProps) {
	return (
		<span
			data-slot="trace-line"
			data-status={status}
			className={cn(
				"cn-trace-line flex w-fit max-w-full min-w-0 items-center text-muted-foreground transition-colors in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=pending]:opacity-60 motion-safe:data-[status=running]:*:data-[slot=trace-title]:shimmer motion-reduce:transition-none",
				className
			)}
			{...props}
		/>
	);
}

export function TraceIcon({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			data-slot="trace-icon"
			className={cn(
				"cn-trace-icon flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
				className
			)}
			{...props}
			aria-hidden="true"
		/>
	);
}

export function TraceTitle({ className, ...props }: ComponentProps<"span">) {
	return <span data-slot="trace-title" className={cn("min-w-0 truncate", className)} {...props} />;
}

export function TraceDescription({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			data-slot="trace-description"
			className={cn("shrink-0 text-muted-foreground/70 tabular-nums", className)}
			{...props}
		/>
	);
}

export type TraceCollapsibleProps = Omit<CollapsibleProps, "appearance">;
export function TraceCollapsible({ className, ...props }: TraceCollapsibleProps) {
	return (
		<Collapsible
			data-slot="trace-collapsible"
			className={cn("flex w-full min-w-0 flex-col", className)}
			{...props}
		/>
	);
}

export type TraceCollapsibleTriggerProps = Omit<CollapsibleTriggerProps, "asChild">;
export function TraceCollapsibleTrigger({
	className,
	children,
	...props
}: TraceCollapsibleTriggerProps) {
	return (
		<CollapsibleTrigger
			data-slot="trace-collapsible-trigger"
			className={cn(
				"cn-trace-collapsible-trigger group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center text-start outline-none focus-visible:outline-hidden! focus-visible:-outline-offset-2! disabled:cursor-default disabled:opacity-50 has-[[data-status=error]]:text-destructive",
				className
			)}
			{...props}
		>
			{children}
			<TraceIcon className="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90 motion-reduce:transition-none rtl:rotate-180 rtl:group-aria-expanded/trace-collapsible-trigger:rotate-90">
				<ChevronRight />
			</TraceIcon>
		</CollapsibleTrigger>
	);
}

export type TraceCollapsibleContentProps = Omit<CollapsibleContentProps, "asChild">;
export function TraceCollapsibleContent({
	className,
	children,
	forceMount,
	...props
}: TraceCollapsibleContentProps) {
	// The SDK panel owns presence so a measured exit can finish before it hides.
	return (
		<SdkPanel
			data-slot="trace-collapsible-content"
			keepMounted={forceMount}
			className="cn-trace-collapsible-content min-w-0 overflow-hidden [--accordion-panel-height:var(--collapsible-panel-height)] motion-safe:data-open:animate-[accordion-down_200ms_ease-out] motion-safe:data-closed:animate-[accordion-up_200ms_ease-out]"
			{...props}
			render={(attrs, state) => <div {...attrs} data-slot="trace-collapsible-content" hidden={forceMount ? props.hidden : attrs.hidden} data-state={state.open ? "open" : "closed"} />}
		>
			<div
				data-slot="trace-collapsible-content-inner"
				className={cn(
					"cn-trace-collapsible-content-inner min-w-0 wrap-break-word text-muted-foreground",
					className
				)}
			>
				{children}
			</div>
		</SdkPanel>
	);
}
