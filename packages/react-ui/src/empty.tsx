import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type EmptyAppearance = "default" | "issue-list" | "filtered-list";
export type EmptyProps = ComponentProps<"div"> & { appearance?: EmptyAppearance };

export function Empty({ className, appearance = "default", ...props }: EmptyProps) {
	return (
		<div
			data-slot="empty"
			data-appearance={appearance}
			className={cn(
				"cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
				appearance !== "default" && "cn-empty-issue-list",
				appearance === "filtered-list" && "cn-empty-filtered-list",
				className
			)}
			{...props}
		/>
	);
}

export function EmptyHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-header"
			className={cn("cn-empty-header flex max-w-sm flex-col items-center", className)}
			{...props}
		/>
	);
}

const emptyMediaVariants = cva(
	"cn-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: { variant: { default: "cn-empty-media-default", icon: "cn-empty-media-icon" } },
		defaultVariants: { variant: "default" },
	}
);

export type EmptyMediaVariant = NonNullable<VariantProps<typeof emptyMediaVariants>["variant"]>;
export type EmptyMediaProps = ComponentProps<"div"> & { variant?: EmptyMediaVariant };

export function EmptyMedia({ className, variant = "default", ...props }: EmptyMediaProps) {
	return (
		<div
			data-slot="empty-icon"
			data-variant={variant}
			className={cn(emptyMediaVariants({ variant }), className)}
			{...props}
		/>
	);
}

export function EmptyTitle({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-title"
			className={cn("cn-font-heading cn-empty-title", className)}
			{...props}
		/>
	);
}

export function EmptyDescription({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-description"
			className={cn(
				"cn-empty-description text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
				className
			)}
			{...props}
		/>
	);
}

export function EmptyContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-content"
			className={cn(
				"cn-empty-content flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
				className
			)}
			{...props}
		/>
	);
}
