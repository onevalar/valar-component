// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
import { Button as SdkButton } from "@ui-sdk/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import React, { type ComponentProps } from "react";
import { Button, type ButtonProps } from "./button.tsx";

export const attachmentVariants = cva(
	"cn-attachment group/attachment relative isolate flex max-w-full min-w-0 shrink-0 flex-wrap text-card-foreground transition-colors motion-reduce:transition-none has-[>a[href],>button:enabled]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed",
	{
		variants: {
			size: {
				default: "cn-attachment-size-default",
				sm: "cn-attachment-size-sm",
				xs: "cn-attachment-size-xs",
			},
			orientation: {
				horizontal: "cn-attachment-orientation-horizontal items-center",
				vertical: "cn-attachment-orientation-vertical flex-col",
			},
		},
		defaultVariants: { size: "default", orientation: "horizontal" },
	}
);

export const attachmentMediaVariants = cva(
	"cn-attachment-media relative flex aspect-square shrink-0 items-center justify-center overflow-hidden group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive [&_svg]:pointer-events-none",
	{
		variants: {
			variant: {
				icon: "",
				image:
					"cn-attachment-media-variant-image *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
			},
		},
		defaultVariants: { variant: "icon" },
	}
);

export type AttachmentSize = NonNullable<VariantProps<typeof attachmentVariants>["size"]>;
export type AttachmentOrientation = NonNullable<
	VariantProps<typeof attachmentVariants>["orientation"]
>;
export type AttachmentMediaVariant = NonNullable<
	VariantProps<typeof attachmentMediaVariants>["variant"]
>;
export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";
export type AttachmentProps = ComponentProps<"div"> & {
	state?: AttachmentState;
	size?: AttachmentSize;
	orientation?: AttachmentOrientation;
};

export function Attachment({
	className,
	size = "default",
	orientation = "horizontal",
	state = "done",
	...props
}: AttachmentProps) {
	return (
		<div
			data-slot="attachment"
			data-state={state}
			data-size={size}
			data-orientation={orientation}
			className={cn(attachmentVariants({ size, orientation }), className)}
			{...props}
		/>
	);
}

export function AttachmentGroup({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="attachment-group"
			className={cn(
				"cn-attachment-group flex min-w-0 scroll-fade-x snap-x snap-mandatory scrollbar-none overflow-x-auto overscroll-x-contain focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
				className
			)}
			{...props}
		/>
	);
}

export type AttachmentMediaProps = ComponentProps<"div"> & { variant?: AttachmentMediaVariant };
export function AttachmentMedia({ className, variant = "icon", ...props }: AttachmentMediaProps) {
	return (
		<div
			data-slot="attachment-media"
			data-variant={variant}
			className={cn(attachmentMediaVariants({ variant }), className)}
			{...props}
		/>
	);
}

export function AttachmentContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="attachment-content"
			className={cn("cn-attachment-content max-w-full min-w-0 flex-1", className)}
			{...props}
		/>
	);
}

export function AttachmentTitle({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			data-slot="attachment-title"
			className={cn(
				"cn-attachment-title block max-w-full min-w-0 truncate motion-safe:group-data-[state=processing]/attachment:shimmer motion-safe:group-data-[state=uploading]/attachment:shimmer",
				className
			)}
			{...props}
		/>
	);
}

export function AttachmentDescription({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			data-slot="attachment-description"
			className={cn(
				"cn-attachment-description block max-w-full min-w-0 truncate text-muted-foreground group-data-[state=error]/attachment:text-destructive/80",
				className
			)}
			{...props}
		/>
	);
}

export function AttachmentActions({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="attachment-actions"
			className={cn("cn-attachment-actions z-20 flex shrink-0 items-center", className)}
			{...props}
		/>
	);
}

export type AttachmentActionProps = ButtonProps;
export function AttachmentAction({
	className,
	variant = "ghost",
	size = "icon-xs",
	...props
}: AttachmentActionProps) {
	if (props.href !== undefined) {
		const { disabled, asChild: _asChild, ...anchor } = props;
		return (
			<Button asChild variant={variant} size={size} disabled={disabled} className={className}>
				<a {...anchor} data-slot="attachment-action" />
			</Button>
		);
	}
	return (
		<Button
			{...props}
			data-slot="attachment-action"
			variant={variant}
			size={size}
			className={className}
		/>
	);
}

export type AttachmentTriggerProps =
	| (ComponentProps<"button"> & { href?: never })
	| (ComponentProps<"a"> & { href: string; disabled?: boolean });

// Place next to Content/Actions, not around them. Outer primitives (e.g.
// DialogTrigger asChild) can compose onto this element without nesting buttons.
export function AttachmentTrigger({ className, ...props }: AttachmentTriggerProps) {
	const classes = cn("cn-attachment-trigger rounded-[inherit] disabled:cursor-default", className);
	if (props.href !== undefined) {
		const { href, disabled, tabIndex, onClick, ...anchor } = props;
		return (
			<a
				{...anchor}
				data-slot="attachment-trigger"
				className={classes}
				href={disabled ? undefined : href}
				role={disabled ? "link" : anchor.role}
				aria-disabled={disabled || anchor["aria-disabled"]}
				tabIndex={disabled ? -1 : tabIndex}
				onClick={
					disabled
						? (event) => {
								event.preventDefault();
								event.stopPropagation();
							}
						: onClick
				}
			/>
		);
	}
	const { onClick, type = "button", ...button } = props;
	return (
		<SdkButton
			{...button}
			type={type}
			className={classes}
			onClick={onClick && ((event) => onClick(event as React.MouseEvent<HTMLButtonElement>))}
			render={(attrs) => <button {...attrs} data-slot="attachment-trigger" />}
		/>
	);
}
