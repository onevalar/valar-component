import { cva } from "class-variance-authority";
import { cn } from "cn";
import React, { type ComponentProps } from "react";
import { Label, type LabelProps } from "./label.tsx";
import { Separator } from "./separator.tsx";

export type FieldAppearance = "default" | "settings";
export type FieldOrientation = "vertical" | "horizontal" | "responsive";

const fieldVariants = cva("cn-field group/field flex w-full", {
	variants: {
		appearance: { default: "", settings: "cn-field-appearance-settings" },
		orientation: {
			vertical: "cn-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto",
			horizontal:
				"cn-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
			responsive:
				"cn-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
		},
	},
	compoundVariants: [
		{
			appearance: "settings",
			orientation: "horizontal",
			class: "has-[>[data-slot=field-content]]:items-center",
		},
		{
			appearance: "settings",
			orientation: "responsive",
			class: "@md/field-group:has-[>[data-slot=field-content]]:items-center",
		},
	],
	defaultVariants: { appearance: "default", orientation: "vertical" },
});

export function Field({
	className,
	appearance = "default",
	orientation = "vertical",
	...props
}: ComponentProps<"div"> & { appearance?: FieldAppearance; orientation?: FieldOrientation }) {
	return (
		<div
			role="group"
			data-slot="field"
			data-appearance={appearance}
			data-orientation={orientation}
			className={cn(fieldVariants({ appearance, orientation }), className)}
			{...props}
		/>
	);
}

export function FieldSet({ className, ...props }: ComponentProps<"fieldset">) {
	return (
		<fieldset
			data-slot="field-set"
			className={cn("cn-field-set flex flex-col", className)}
			{...props}
		/>
	);
}

export function FieldLegend({
	className,
	variant = "legend",
	...props
}: ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
	return (
		<legend
			data-slot="field-legend"
			data-variant={variant}
			className={cn("cn-field-legend", className)}
			{...props}
		/>
	);
}

export function FieldGroup({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="field-group"
			className={cn(
				"cn-field-group group/field-group @container/field-group flex w-full flex-col",
				className
			)}
			{...props}
		/>
	);
}

export function FieldContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="field-content"
			className={cn(
				"cn-field-content group/field-content flex flex-1 flex-col leading-snug",
				className
			)}
			{...props}
		/>
	);
}

export function FieldLabel({ className, ...props }: LabelProps) {
	return (
		<Label
			data-slot="field-label"
			className={cn(
				"cn-field-label group/field-label peer/field-label flex w-fit has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
				className
			)}
			{...props}
		/>
	);
}

export function FieldTitle({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="field-title"
			className={cn("cn-field-title flex w-fit items-center", className)}
			{...props}
		/>
	);
}

export function FieldDescription({ className, ...props }: ComponentProps<"p">) {
	return (
		<p
			data-slot="field-description"
			className={cn(
				"cn-field-description leading-normal font-normal group-has-data-horizontal/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
				className
			)}
			{...props}
		/>
	);
}

export function FieldSeparator({ className, children, ...props }: ComponentProps<"div">) {
	const hasContent = children != null && typeof children !== "boolean";
	return (
		<div
			data-slot="field-separator"
			data-content={hasContent}
			className={cn("cn-field-separator relative", className)}
			{...props}
		>
			<Separator decorative className="absolute inset-0 top-1/2" />
			{hasContent && (
				<span
					data-slot="field-separator-content"
					className="cn-field-separator-content relative mx-auto block w-fit bg-background"
				>
					{children}
				</span>
			)}
		</div>
	);
}

export function FieldError({
	className,
	children,
	errors,
	...props
}: ComponentProps<"div"> & { errors?: readonly ({ message?: string } | null | undefined)[] }) {
	const messages = [...new Set(errors?.flatMap((error) => error?.message?.trim() || []))];
	const hasContent = children != null && typeof children !== "boolean";
	if (!hasContent && messages.length === 0) return null;
	return (
		<div
			role="alert"
			data-slot="field-error"
			className={cn("cn-field-error font-normal", className)}
			{...props}
		>
			{hasContent ? (
				children
			) : messages.length === 1 ? (
				messages[0]
			) : (
				<ul className="ms-4 flex list-disc flex-col gap-1">
					{messages.map((message) => (
						<li key={message}>{message}</li>
					))}
				</ul>
			)}
		</div>
	);
}
