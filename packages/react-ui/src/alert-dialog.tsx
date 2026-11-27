"use client";

import * as React from "react";
import {
	AlertDialog as SdkAlertDialog,
	AlertDialogBackdrop as SdkBackdrop,
	AlertDialogClose as SdkClose,
	AlertDialogContent as SdkContent,
	AlertDialogDescription as SdkDescription,
	AlertDialogTitle as SdkTitle,
	AlertDialogTrigger as SdkTrigger,
	type AlertDialogController,
	type AlertDialogOpenChangeReason,
	type AlertDialogPayloadChangeReason,
} from "@ui-sdk/react/alert-dialog";
import type {
	DialogDismissAttemptDetails,
	DialogFinalFocus,
	DialogInitialFocus,
} from "@ui-sdk/react/dialog";
import type { ActionDetails, ChangeDetails } from "@ui-sdk/core";
import { cn } from "cn";
import { Slot } from "radix-ui";
import { Button, buttonVariants, type ButtonProps } from "./button.tsx";

type AlertDialogDismissPolicy = {
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

const AlertDialogContext = React.createContext<{
	policyRef: React.MutableRefObject<AlertDialogDismissPolicy>;
} | null>(null);

export interface AlertDialogProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (
		open: boolean,
		details?: ChangeDetails<AlertDialogOpenChangeReason> & { returnValue?: string }
	) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	onPayloadChange?: (
		payload: unknown,
		details: ChangeDetails<AlertDialogPayloadChangeReason>
	) => void;
	onDismissAttempt?: (details: DialogDismissAttemptDetails) => void;
	controller?: AlertDialogController<unknown, unknown>;
	dismissible?: boolean;
	persistentElements?: (Element | string)[] | (() => Element[]);
	pendingAnnouncement?: string;
	container?: Element | DocumentFragment | null;
	children?: React.ReactNode;
}

export function AlertDialog({ onOpenChange, children, ...props }: AlertDialogProps) {
	const policyRef = React.useRef<AlertDialogDismissPolicy>({});
	const contextValue = React.useMemo(() => ({ policyRef }), []);

	function handleOpenChange(
		next: boolean,
		details: ChangeDetails<AlertDialogOpenChangeReason> & { returnValue?: string }
	) {
		if (!next && details.reason === "escape-key" && policyRef.current.onEscapeKeyDown) {
			const original = details.event;
			const event = new KeyboardEvent("keydown", {
				key: "Escape",
				cancelable: true,
				isComposing: original instanceof KeyboardEvent ? original.isComposing : false,
			});
			if (original?.target) {
				Object.defineProperty(event, "target", { value: original.target });
			}
			policyRef.current.onEscapeKeyDown(event);
			if (event.defaultPrevented) {
				details.cancel();
				return;
			}
		}
		onOpenChange?.(next, details);
		if (!next && !details.canceled && details.reason === "escape-key") {
			details.event?.stopPropagation();
		}
	}

	return (
		<AlertDialogContext.Provider value={contextValue}>
			<SdkAlertDialog {...props} onOpenChange={handleOpenChange}>
				{children}
			</SdkAlertDialog>
		</AlertDialogContext.Provider>
	);
}

export interface AlertDialogPortalProps {
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	children?: React.ReactNode;
}

export function AlertDialogPortal({ children }: AlertDialogPortalProps) {
	return <>{children}</>;
}

export type AlertDialogTriggerProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
	controller?: AlertDialogController<unknown, unknown>;
	focusableWhenDisabled?: boolean;
	payload?: unknown;
	shortcut?: string;
};

export function AlertDialogTrigger({ asChild, children, ...props }: AlertDialogTriggerProps) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkTrigger
			data-slot="alert-dialog-trigger"
			{...props}
			render={(attrs, state) => (
				<Element {...attrs} data-state={state.open ? "open" : "closed"}>
					{children}
				</Element>
			)}
		/>
	);
}

export function AlertDialogOverlay({
	className,
	...props
}: React.ComponentPropsWithRef<"div">) {
	return (
		<SdkBackdrop
			data-slot="alert-dialog-overlay"
			className={cn("cn-alert-dialog-overlay fixed inset-0 z-50", className)}
			{...props}
			render={(attrs, state) => (
				<div
					{...attrs}
					data-slot="alert-dialog-overlay"
					data-state={state.open ? "open" : "closed"}
				/>
			)}
		/>
	);
}

export type AlertDialogContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> & {
	children?: React.ReactNode;
	size?: "default" | "sm";
	appearance?: "default" | "confirmation" | "danger";
	focusCancel?: boolean;
	portalProps?: false | Omit<AlertDialogPortalProps, "children">;
	container?: Element | DocumentFragment | null;
	inline?: boolean;
	forceMount?: boolean;
	keepMounted?: boolean;
	initialFocus?: DialogInitialFocus;
	finalFocus?: DialogFinalFocus;
	onOpenAutoFocus?: (event: Event) => void;
	onCloseAutoFocus?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

export function AlertDialogContent({
	className,
	size = "default",
	appearance = "default",
	focusCancel = true,
	portalProps,
	container: containerProp,
	inline: inlineProp,
	forceMount,
	keepMounted,
	initialFocus: initialFocusProp,
	finalFocus: finalFocusProp,
	onOpenAutoFocus,
	onCloseAutoFocus,
	onEscapeKeyDown,
	children,
	...props
}: AlertDialogContentProps) {
	const ctx = React.useContext(AlertDialogContext);
	const contentElRef = React.useRef<HTMLElement | null>(null);

	React.useEffect(() => {
		if (!ctx) return;
		ctx.policyRef.current = { onEscapeKeyDown };
		return () => {
			ctx.policyRef.current = {};
		};
	}, [ctx, onEscapeKeyDown]);

	const resolvedInline = inlineProp ?? portalProps === false;
	const resolvedContainer = resolvedInline
		? undefined
		: (containerProp ?? (portalProps ? portalProps.container : undefined) ?? undefined);
	const resolvedKeepMounted =
		keepMounted ?? forceMount ?? (portalProps ? portalProps.forceMount : undefined);

	const resolvedInitialFocus = React.useMemo<DialogInitialFocus | undefined>(() => {
		if (initialFocusProp !== undefined) return initialFocusProp;
		return () => {
			const content = contentElRef.current;
			if (onOpenAutoFocus) {
				const before = document.activeElement;
				const event = new Event("openAutoFocus", { cancelable: true });
				if (content) Object.defineProperty(event, "target", { value: content });
				onOpenAutoFocus(event);
				if (event.defaultPrevented) {
					if (document.activeElement !== before && document.activeElement instanceof HTMLElement) {
						return document.activeElement;
					}
					return before instanceof HTMLElement ? before : content;
				}
			}
			if (!content) return undefined;
			const enabled = ':not(:disabled,[aria-disabled="true"],[tabindex="-1"])';
			if (focusCancel) {
				const cancel = content.querySelector<HTMLElement>(
					`[data-slot="alert-dialog-cancel"]${enabled}`
				);
				if (cancel) return cancel;
				return content;
			}
			const control = content.querySelector<HTMLElement>(
				`:is(button,a[href],input,select,textarea,[tabindex])${enabled}`
			);
			return control ?? content;
		};
	}, [initialFocusProp, onOpenAutoFocus, focusCancel]);

	const resolvedFinalFocus = React.useMemo<DialogFinalFocus | undefined>(() => {
		if (finalFocusProp !== undefined) return finalFocusProp;
		if (!onCloseAutoFocus) return undefined;
		return () => {
			const event = new Event("closeAutoFocus", { cancelable: true });
			onCloseAutoFocus(event);
			if (event.defaultPrevented) {
				return document.activeElement instanceof HTMLElement ? document.activeElement : null;
			}
			return undefined;
		};
	}, [finalFocusProp, onCloseAutoFocus]);

	const hasExplicitAriaLabel = Boolean(props["aria-label"]) && !props["aria-labelledby"];

	return (
		<>
			{!resolvedInline && <AlertDialogOverlay />}
			<SdkContent
				initialFocus={resolvedInitialFocus}
				finalFocus={resolvedFinalFocus}
				keepMounted={resolvedKeepMounted}
				inline={resolvedInline}
				container={resolvedContainer}
				data-slot="alert-dialog-content"
				data-size={size}
				data-appearance={appearance}
				className={cn(
					"cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none",
					appearance === "danger" && "cn-alert-dialog-danger",
					className
				)}
				{...props}
				render={(attrs, state) => {
					const sdkRef = attrs.ref as React.Ref<HTMLElement> | undefined;
					const mergedRef = (node: HTMLElement | null) => {
						contentElRef.current = node;
						if (typeof sdkRef === "function") sdkRef(node);
						else if (sdkRef && "current" in sdkRef)
							(sdkRef as React.MutableRefObject<HTMLElement | null>).current = node;
					};
					return (
						<div
							{...attrs}
							ref={mergedRef}
							data-slot="alert-dialog-content"
							aria-labelledby={hasExplicitAriaLabel ? undefined : attrs["aria-labelledby"]}
							data-state={state.open ? "open" : "closed"}
						>
							{children}
						</div>
					);
				}}
			/>
		</>
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

export type AlertDialogCancelProps = React.ComponentPropsWithRef<"button"> &
	AlertDialogButtonStyle & {
		asChild?: boolean;
		value?: string;
		action?: (event: Event | undefined, details: ActionDetails) => unknown;
	};

export function AlertDialogCancel({
	className,
	variant = "outline",
	size = "default",
	asChild,
	children,
	onClickCapture,
	...props
}: AlertDialogCancelProps) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkClose
			data-slot="alert-dialog-cancel"
			data-variant={variant}
			className={cn(
				buttonVariants({ variant, size, shape: "pill" }),
				"cn-alert-dialog-cancel",
				className
			)}
			{...props}
			render={(attrs) => (
				<Element
					{...attrs}
					data-slot="alert-dialog-cancel"
					onClickCapture={(event: React.MouseEvent<HTMLButtonElement>) => {
						if (props["aria-disabled"] === true || props["aria-disabled"] === "true") {
							event.preventDefault();
							event.stopPropagation();
							return;
						}
						onClickCapture?.(event);
					}}
				>
					{children}
				</Element>
			)}
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
	asChild,
	children,
	...props
}: React.ComponentPropsWithRef<"h2"> & { asChild?: boolean }) {
	const Element = asChild ? Slot.Root : "h2";
	return (
		<SdkTitle
			data-slot="alert-dialog-title"
			className={cn("cn-font-heading cn-alert-dialog-title", className)}
			{...props}
			render={(attrs) => <Element {...attrs}>{children}</Element>}
		/>
	);
}

export function AlertDialogDescription({
	className,
	asChild,
	children,
	...props
}: React.ComponentPropsWithRef<"p"> & { asChild?: boolean }) {
	const Element = asChild ? Slot.Root : "p";
	return (
		<SdkDescription
			data-slot="alert-dialog-description"
			className={cn("cn-alert-dialog-description", className)}
			{...props}
			render={(attrs) => <Element {...attrs}>{children}</Element>}
		/>
	);
}
