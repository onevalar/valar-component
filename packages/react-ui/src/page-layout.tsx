import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type PageLayoutWidth = "full" | "narrow";
export type PageLayoutProps = ComponentProps<"div"> & { width?: PageLayoutWidth };

export function PageLayout({ className, width = "full", ...props }: PageLayoutProps) {
	return (
		<div
			data-slot="page-layout"
			data-width={width}
			className={cn(
				"flex w-full min-w-0 flex-col gap-6",
				width === "narrow" && "mx-auto max-w-3xl",
				className
			)}
			{...props}
		/>
	);
}

export function PageLayoutHeader({ className, ...props }: ComponentProps<"header">) {
	return (
		<header
			data-slot="page-layout-header"
			className={cn(
				"flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2",
				className
			)}
			{...props}
		/>
	);
}

export function PageLayoutTitle({
	className,
	tag: Tag = "h1",
	...props
}: ComponentProps<"h1"> & { tag?: "h1" | "h2" }) {
	return (
		<Tag
			data-slot="page-layout-title"
			className={cn(
				"min-w-0 truncate text-lg font-semibold tracking-tight text-foreground",
				className
			)}
			{...props}
		/>
	);
}

export function PageLayoutActions({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="page-layout-actions"
			className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}
			{...props}
		/>
	);
}

export function PageLayoutToolbar({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="page-layout-toolbar"
			className={cn("flex min-w-0 flex-wrap items-center justify-between gap-2", className)}
			{...props}
		/>
	);
}

export type PageLayoutSurface = "plain" | "card";
export type PageLayoutSectionProps = ComponentProps<"section"> & { surface?: PageLayoutSurface };

export function PageLayoutSection({
	className,
	surface = "plain",
	...props
}: PageLayoutSectionProps) {
	return (
		<section
			data-slot="page-layout-section"
			data-surface={surface}
			className={cn(
				"flex min-w-0 flex-col",
				surface === "card"
					? "overflow-hidden rounded-lg border-[0.5px] border-border bg-card"
					: "gap-3",
				className
			)}
			{...props}
		/>
	);
}

export function PageLayoutSectionTitle({ className, ...props }: ComponentProps<"h2">) {
	return (
		<h2
			data-slot="page-layout-section-title"
			className={cn("text-sm font-medium text-foreground", className)}
			{...props}
		/>
	);
}

export type PageLayoutPropertyAppearance = "settings" | "detail";
export type PageLayoutPropertyListProps = ComponentProps<"div"> & {
	layout?: PageLayoutPropertyAppearance;
};
export type PageLayoutPropertyRowProps = PageLayoutPropertyListProps & {
	label: string;
	description?: string;
};

export function PageLayoutPropertyList({
	className,
	layout = "settings",
	...props
}: PageLayoutPropertyListProps) {
	return (
		<div
			data-slot="page-layout-property-list"
			data-layout={layout}
			className={cn(
				"flex min-w-0 flex-col",
				layout === "settings" ? "divide-y-[0.5px] divide-border" : "gap-2.5",
				className
			)}
			{...props}
		/>
	);
}

export function PageLayoutPropertyRow({
	className,
	children,
	label,
	description,
	layout = "settings",
	...props
}: PageLayoutPropertyRowProps) {
	return (
		<div
			data-slot="page-layout-property-row"
			data-layout={layout}
			className={cn(
				layout === "settings"
					? "flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
					: "flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4",
				className
			)}
			{...props}
		>
			{layout === "settings" ? (
				<>
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="text-sm font-medium text-foreground">{label}</span>
						{description && <span className="text-xs text-muted-foreground">{description}</span>}
					</div>
					<div className="flex shrink-0 items-center gap-2">{children}</div>
				</>
			) : (
				<>
					<span className="w-28 shrink-0 text-sm text-muted-foreground">{label}</span>
					<div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-foreground tabular-nums">
						{children}
					</div>
				</>
			)}
		</div>
	);
}
