// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";
import React, { type ComponentProps } from "react";

export const bubbleVariants = cva("cn-bubble group/bubble relative flex w-fit min-w-0 flex-col", {
	variants: {
		variant: {
			default: "cn-bubble-variant-default",
			secondary: "cn-bubble-variant-secondary",
			muted: "cn-bubble-variant-muted",
			tinted: "cn-bubble-variant-tinted",
			outline: "cn-bubble-variant-outline",
			ghost: "cn-bubble-variant-ghost",
			destructive: "cn-bubble-variant-destructive",
		},
	},
	defaultVariants: { variant: "default" },
});

export const bubbleReactionsVariants = cva(
	"cn-bubble-reactions absolute z-10 flex w-fit items-center justify-center",
	{
		variants: {
			side: { top: "cn-bubble-reactions-side-top", bottom: "cn-bubble-reactions-side-bottom" },
			align: { start: "start-3", end: "end-3" },
		},
		defaultVariants: { side: "bottom", align: "end" },
	}
);

export type BubbleVariant = NonNullable<VariantProps<typeof bubbleVariants>["variant"]>;
export type BubbleAlign = "start" | "end";
export type BubbleReactionsSide = NonNullable<VariantProps<typeof bubbleReactionsVariants>["side"]>;
export type BubbleReactionsAlign = NonNullable<
	VariantProps<typeof bubbleReactionsVariants>["align"]
>;
export type BubbleProps = ComponentProps<"div"> & { variant?: BubbleVariant; align?: BubbleAlign };

export function Bubble({ className, variant = "default", align = "start", ...props }: BubbleProps) {
	return (
		<div
			data-slot="bubble"
			data-variant={variant}
			data-align={align}
			className={cn(bubbleVariants({ variant }), className)}
			{...props}
		/>
	);
}

export function BubbleGroup({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="bubble-group"
			className={cn("cn-bubble-group flex min-w-0 flex-col", className)}
			{...props}
		/>
	);
}

export type BubbleContentProps = ComponentProps<"div"> & { asChild?: boolean };
export function BubbleContent({ className, asChild = false, ...props }: BubbleContentProps) {
	const Comp = asChild ? Slot.Root : "div";
	return (
		<Comp
			data-slot="bubble-content"
			className={cn(
				"cn-bubble-content w-fit max-w-full min-w-0 overflow-hidden wrap-break-word motion-reduce:transition-none [button]:text-start [button,a]:transition-colors",
				className
			)}
			{...props}
		/>
	);
}

export type BubbleReactionsProps = ComponentProps<"div"> & {
	side?: BubbleReactionsSide;
	align?: BubbleReactionsAlign;
};
export function BubbleReactions({
	className,
	side = "bottom",
	align = "end",
	...props
}: BubbleReactionsProps) {
	return (
		<div
			data-slot="bubble-reactions"
			data-side={side}
			data-align={align}
			className={cn(bubbleReactionsVariants({ side, align }), className)}
			{...props}
		/>
	);
}
