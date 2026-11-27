"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Accordion as AccordionPrimitive, Direction, Slot } from "radix-ui";

export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> & {
	loop?: boolean;
};

export function Accordion({
	className,
	dir,
	loop = true,
	onKeyDown,
	orientation = "vertical",
	...props
}: AccordionProps) {
	const direction = Direction.useDirection(dir);
	const rootProps = {
		"data-slot": "accordion",
		className: cn("cn-accordion flex w-full flex-col", className),
		dir: direction,
		orientation,
		onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
			onKeyDown?.(event);
			if (loop || event.defaultPrevented) return;
			const nextKey =
				orientation === "vertical" ? "ArrowDown" : direction === "rtl" ? "ArrowLeft" : "ArrowRight";
			const prevKey =
				orientation === "vertical" ? "ArrowUp" : direction === "rtl" ? "ArrowRight" : "ArrowLeft";
			if (event.key !== nextKey && event.key !== prevKey) return;
			// Let Radix handle navigation except for an arrow that would wrap at the boundary.
			const root = event.currentTarget;
			const triggers = Array.from(
				root.querySelectorAll('[data-slot="accordion-trigger"]:not(:disabled)')
			).filter((trigger) => trigger.closest('[data-slot="accordion"]') === root);
			const boundary = event.key === nextKey ? triggers.at(-1) : triggers[0];
			if (event.target === boundary) event.preventDefault();
		},
	};
	return props.type === "single" ? (
		<AccordionPrimitive.Root {...rootProps} collapsible {...props} />
	) : (
		<AccordionPrimitive.Root {...rootProps} {...props} />
	);
}

export type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;

export function AccordionItem({ className, ...props }: AccordionItemProps) {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			className={cn("cn-accordion-item", className)}
			{...props}
		/>
	);
}

export type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export function AccordionTrigger({
	className,
	level = 3,
	children,
	...props
}: AccordionTriggerProps) {
	const Heading = `h${level}` as const;
	return (
		<AccordionPrimitive.Header asChild className="flex">
			<Heading>
				<AccordionPrimitive.Trigger
					data-slot="accordion-trigger"
					className={cn(
						"cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent text-start outline-none disabled:pointer-events-none disabled:opacity-50",
						className
					)}
					{...props}
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
				</AccordionPrimitive.Trigger>
			</Heading>
		</AccordionPrimitive.Header>
	);
}

export type AccordionContentProps = Omit<
	React.ComponentProps<typeof AccordionPrimitive.Content>,
	"asChild"
>;

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
	return (
		<AccordionPrimitive.Content
			data-slot="accordion-content"
			className="cn-accordion-content overflow-hidden [--accordion-panel-height:var(--radix-accordion-content-height)] motion-reduce:animate-none!"
			{...props}
		>
			<div
				className={cn(
					"cn-accordion-content-inner [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
					className
				)}
			>
				{children}
			</div>
		</AccordionPrimitive.Content>
	);
}
