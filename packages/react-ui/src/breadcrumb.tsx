import { cn } from "cn";
import { ChevronRight, Ellipsis } from "lucide-react";
import { Slot } from "radix-ui";
import React, { type ComponentProps } from "react";

export type BreadcrumbAppearance = "default" | "workspace";
export type BreadcrumbProps = ComponentProps<"nav"> & { appearance?: BreadcrumbAppearance };

export function Breadcrumb({ className, appearance = "default", ...props }: BreadcrumbProps) {
	return (
		<nav
			data-slot="breadcrumb"
			data-appearance={appearance}
			aria-label="面包屑导航"
			className={cn(
				"cn-breadcrumb",
				appearance === "workspace" && "cn-breadcrumb-workspace",
				className
			)}
			{...props}
		/>
	);
}

export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
	return (
		<ol
			data-slot="breadcrumb-list"
			className={cn("cn-breadcrumb-list flex flex-wrap items-center wrap-break-word", className)}
			{...props}
		/>
	);
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
	return (
		<li
			data-slot="breadcrumb-item"
			className={cn("cn-breadcrumb-item inline-flex items-center", className)}
			{...props}
		/>
	);
}

export function BreadcrumbLink({
	className,
	asChild,
	...props
}: ComponentProps<"a"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "a";
	return (
		<Comp data-slot="breadcrumb-link" className={cn("cn-breadcrumb-link", className)} {...props} />
	);
}

export function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			data-slot="breadcrumb-page"
			role="link"
			aria-disabled="true"
			aria-current="page"
			className={cn("cn-breadcrumb-page", className)}
			{...props}
		/>
	);
}

export function BreadcrumbSeparator({ className, children, ...props }: ComponentProps<"li">) {
	const isDefault = children == null || typeof children === "boolean";
	return (
		<li
			data-slot="breadcrumb-separator"
			data-default={isDefault ? "" : undefined}
			role="presentation"
			aria-hidden="true"
			className={cn("cn-breadcrumb-separator", className)}
			{...props}
		>
			{isDefault ? <ChevronRight className="rtl:rotate-180" /> : children}
		</li>
	);
}

export function BreadcrumbEllipsis({
	className,
	label = "更多",
	...props
}: Omit<ComponentProps<"span">, "children"> & { label?: string }) {
	return (
		<span
			data-slot="breadcrumb-ellipsis"
			className={cn("cn-breadcrumb-ellipsis flex items-center justify-center", className)}
			{...props}
		>
			<Ellipsis aria-hidden="true" />
			<span className="sr-only">{label}</span>
		</span>
	);
}
