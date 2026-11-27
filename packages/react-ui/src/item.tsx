import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";
import React, { type ComponentProps } from "react";
import { Separator } from "./separator.tsx";

const itemVariants = cva(
	"cn-item group/item flex w-full min-w-0 flex-wrap items-center transition-colors duration-150 outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none",
	{
		variants: {
			variant: {
				default: "cn-item-variant-default",
				outline: "cn-item-variant-outline",
				muted: "cn-item-variant-muted",
			},
			size: {
				default: "cn-item-size-default",
				sm: "cn-item-size-sm",
				xs: "cn-item-size-xs",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	}
);

export type ItemVariant = NonNullable<VariantProps<typeof itemVariants>["variant"]>;
export type ItemSize = NonNullable<VariantProps<typeof itemVariants>["size"]>;
export type ItemAppearance = "default" | "issue-row";
export type ItemProps = {
	appearance?: ItemAppearance;
	variant?: ItemVariant;
	size?: ItemSize;
} & (
	| (ComponentProps<"div"> & { asChild?: false })
	| (ComponentProps<typeof Slot.Root> & { asChild: true })
);

export function Item({ className, appearance = "default", variant, size, ...props }: ItemProps) {
	const attributes = {
		"data-slot": "item",
		"data-appearance": appearance,
		"data-variant": variant,
		"data-size": size,
		className: cn(
			appearance === "issue-row"
				? "cn-item-issue-row group/item flex w-full items-center"
				: itemVariants({ variant, size }),
			className
		),
	};
	if (props.asChild) {
		const { asChild: _asChild, ...childProps } = props;
		return <Slot.Root {...attributes} {...childProps} />;
	}
	const { asChild: _asChild, ...divProps } = props;
	return <div {...attributes} {...divProps} />;
}

export function ItemGroup({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			role="list"
			data-slot="item-group"
			className={cn("cn-item-group group/item-group flex w-full flex-col", className)}
			{...props}
		/>
	);
}

export function ItemSeparator({
	className,
	orientation = "horizontal",
	...props
}: ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="item-separator"
			orientation={orientation}
			className={cn("cn-item-separator", className)}
			{...props}
		/>
	);
}

export function ItemHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="item-header"
			className={cn("cn-item-header flex basis-full items-center justify-between", className)}
			{...props}
		/>
	);
}

export function ItemFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="item-footer"
			className={cn("cn-item-footer flex basis-full items-center justify-between", className)}
			{...props}
		/>
	);
}

export function ItemContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="item-content"
			className={cn(
				"cn-item-content flex min-w-0 flex-1 flex-col [&+[data-slot=item-content]]:flex-none",
				className
			)}
			{...props}
		/>
	);
}

export function ItemTitle({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="item-title"
			className={cn(
				"cn-item-title line-clamp-1 flex w-fit max-w-full min-w-0 items-center wrap-anywhere",
				className
			)}
			{...props}
		/>
	);
}

export function ItemDescription({ className, ...props }: ComponentProps<"p">) {
	return (
		<p
			data-slot="item-description"
			className={cn(
				"cn-item-description line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
				className
			)}
			{...props}
		/>
	);
}

export function ItemActions({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="item-actions"
			className={cn("cn-item-actions flex max-w-full flex-wrap items-center", className)}
			{...props}
		/>
	);
}

const itemMediaVariants = cva(
	"cn-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
	{
		variants: {
			variant: {
				default: "cn-item-media-variant-default",
				icon: "cn-item-media-variant-icon",
				image: "cn-item-media-variant-image",
			},
		},
		defaultVariants: { variant: "default" },
	}
);

export type ItemMediaVariant = NonNullable<VariantProps<typeof itemMediaVariants>["variant"]>;
export type ItemMediaProps = ComponentProps<"div"> & { variant?: ItemMediaVariant };

export function ItemMedia({ className, variant = "default", ...props }: ItemMediaProps) {
	return (
		<div
			data-slot="item-media"
			data-variant={variant}
			className={cn(itemMediaVariants({ variant }), className)}
			{...props}
		/>
	);
}
