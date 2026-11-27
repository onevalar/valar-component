"use client";

import * as React from "react";
import { cn } from "cn";
import { AlertDialog as Primitive } from "radix-ui";
import { Button, buttonVariants, type ButtonProps } from "./button.tsx";

export const AlertDialog = Primitive.Root;
export const AlertDialogPortal = Primitive.Portal;

export function AlertDialogTrigger(props: React.ComponentProps<typeof Primitive.Trigger>) {
	return <Primitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

export function AlertDialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Overlay>) {
	return (
		<Primitive.Overlay
			data-slot="alert-dialog-overlay"
			className={cn("cn-alert-dialog-overlay fixed inset-0 z-50", className)}
			{...props}
		/>
	);
}

export type AlertDialogContentProps = React.ComponentProps<typeof Primitive.Content> & {
	size?: "default" | "sm";
	appearance?: "default" | "confirmation" | "danger";
	focusCancel?: boolean;
	portalProps?: false | Omit<React.ComponentProps<typeof AlertDialogPortal>, "children">;
};

export function AlertDialogContent({
	className,
	size = "default",
	appearance = "default",
	focusCancel = true,
	portalProps,
	forceMount,
	onOpenAutoFocus,
	...props
}: AlertDialogContentProps) {
	const content = (
		<Primitive.Content
			data-slot="alert-dialog-content"
			data-size={size}
			data-appearance={appearance}
			className={cn(
				"cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none",
				appearance === "danger" && "cn-alert-dialog-danger",
				className
			)}
			forceMount={forceMount}
			{...props}
			onOpenAutoFocus={(event) => {
				onOpenAutoFocus?.(event);
				if (event.defaultPrevented || !(event.target instanceof HTMLElement)) return;
				const content = event.target;
				const enabled = ':not(:disabled,[aria-disabled="true"],[tabindex="-1"])';
				const cancel = focusCancel
					? content.querySelector<HTMLElement>(`[data-slot="alert-dialog-cancel"]${enabled}`)
					: null;
				// Radix Alert Dialog otherwise always focuses Cancel. Allow the caller to
				// opt out and use the first available control, or the dialog itself.
				event.preventDefault();
				cancel?.focus({ preventScroll: true });
				if (cancel && content.ownerDocument.activeElement === cancel) return;
				if (!focusCancel) {
					const controls = content.querySelectorAll<HTMLElement>(
						`:is(button,a[href],input,select,textarea,[tabindex])${enabled}`
					);
					for (const control of controls) {
						control.focus({ preventScroll: true });
						if (content.ownerDocument.activeElement === control) return;
					}
				}
				content.focus({ preventScroll: true });
			}}
		/>
	);
	return portalProps === false ? (
		content
	) : (
		<AlertDialogPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			<AlertDialogOverlay />
			{content}
		</AlertDialogPortal>
	);
}

type AlertDialogButtonStyle = Pick<ButtonProps, "variant" | "size">;

export type AlertDialogActionProps = React.ComponentProps<"button"> &
	AlertDialogButtonStyle & {
		asChild?: boolean;
		/** Blocks activation without disabling or blurring the current action. */
		loading?: boolean;
	};

export function AlertDialogAction({
	className,
	variant = "default",
	size = "default",
	loading = false,
	onClickCapture,
	...props
}: AlertDialogActionProps) {
	return (
		<Button
			variant={variant}
			size={size}
			shape="pill"
			className={cn(
				"cn-alert-dialog-action",
				variant === "destructive" && "bg-[lch(58%_73_29)] hover:bg-[lch(53%_73_29)]",
				className
			)}
			{...props}
			data-slot="alert-dialog-action"
			data-loading={loading ? "" : undefined}
			aria-busy={loading || props["aria-busy"]}
			aria-disabled={loading || props["aria-disabled"]}
			onClickCapture={(event) => {
				if (loading || props["aria-disabled"] === true || props["aria-disabled"] === "true") {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				onClickCapture?.(event);
			}}
		/>
	);
}

export type AlertDialogCancelProps = React.ComponentProps<typeof Primitive.Cancel> &
	AlertDialogButtonStyle;

export function AlertDialogCancel({
	className,
	variant = "outline",
	size = "default",
	onClickCapture,
	...props
}: AlertDialogCancelProps) {
	return (
		<Primitive.Cancel
			data-slot="alert-dialog-cancel"
			data-variant={variant}
			className={cn(
				buttonVariants({ variant, size, shape: "pill" }),
				"cn-alert-dialog-cancel",
				className
			)}
			{...props}
			onClickCapture={(event) => {
				if (props["aria-disabled"] === true || props["aria-disabled"] === "true") {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				onClickCapture?.(event);
			}}
		/>
	);
}

export function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-header"
			className={cn("cn-alert-dialog-header", className)}
			{...props}
		/>
	);
}

export function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-footer"
			className={cn(
				"cn-alert-dialog-footer flex flex-wrap justify-end gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2",
				className
			)}
			{...props}
		/>
	);
}

export function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-media"
			className={cn("cn-alert-dialog-media", className)}
			{...props}
		/>
	);
}

export function AlertDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Title>) {
	return (
		<Primitive.Title
			data-slot="alert-dialog-title"
			className={cn("cn-font-heading cn-alert-dialog-title", className)}
			{...props}
		/>
	);
}

export function AlertDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Description>) {
	return (
		<Primitive.Description
			data-slot="alert-dialog-description"
			className={cn("cn-alert-dialog-description", className)}
			{...props}
		/>
	);
}
