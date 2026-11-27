"use client";

import * as React from "react";
import {
	Dialog as SdkDialog,
	DialogBackdrop as SdkBackdrop,
	DialogClose as SdkClose,
	DialogContent as SdkContent,
	DialogDescription as SdkDescription,
	DialogTitle as SdkTitle,
	DialogTrigger as SdkTrigger,
	type DialogController,
	type DialogDismissAttemptDetails,
	type DialogFinalFocus,
	type DialogInitialFocus,
	type DialogOpenChangeDetails,
	type DialogPayloadChangeReason,
} from "@ui-sdk/react/dialog";
import type { ActionDetails, ChangeDetails } from "@ui-sdk/core";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { Button } from "./button.tsx";

type DialogDismissPolicy = {
	onInteractOutside?: (event: Event) => void;
	onPointerDownOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

const DialogContext = React.createContext<{
	policyRef: React.MutableRefObject<DialogDismissPolicy>;
	modal: boolean | "trap-focus";
} | null>(null);

export interface DialogProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: DialogOpenChangeDetails) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	onPayloadChange?: (
		payload: unknown,
		details: ChangeDetails<DialogPayloadChangeReason>
	) => void;
	onDismissAttempt?: (details: DialogDismissAttemptDetails) => void;
	modal?: boolean | "trap-focus";
	closeOnOutsidePress?: boolean;
	presentation?: "auto" | "dialog" | "sheet";
	controller?: DialogController<unknown, unknown>;
	dismissible?: boolean;
	persistentElements?: (Element | string)[] | (() => Element[]);
	pendingAnnouncement?: string;
	container?: Element | DocumentFragment | null;
	children?: React.ReactNode;
}

function Dialog({
	onOpenChange,
	modal = true,
	presentation = "dialog",
	children,
	...props
}: DialogProps) {
	const policyRef = React.useRef<DialogDismissPolicy>({});
	const contextValue = React.useMemo(() => ({ policyRef, modal }), [modal]);

	function handleOpenChange(next: boolean, details: DialogOpenChangeDetails) {
		if (!next) {
			if (
				details.reason === "outside-press" &&
				(policyRef.current.onInteractOutside || policyRef.current.onPointerDownOutside)
			) {
				const event = new CustomEvent("interactOutside", {
					cancelable: true,
					detail: { originalEvent: details.event },
				});
				if (details.event?.target) {
					Object.defineProperty(event, "target", { value: details.event.target });
				}
				policyRef.current.onPointerDownOutside?.(event);
				if (!event.defaultPrevented) policyRef.current.onInteractOutside?.(event);
				if (event.defaultPrevented) {
					details.cancel();
					return;
				}
			}
			if (details.reason === "escape-key" && policyRef.current.onEscapeKeyDown) {
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
		}
		onOpenChange?.(next, details);
		if (!next && !details.canceled && details.reason === "escape-key") {
			details.event?.stopPropagation();
		}
	}

	return (
		<DialogContext.Provider value={contextValue}>
			<SdkDialog
				{...props}
				modal={modal}
				presentation={presentation}
				onOpenChange={handleOpenChange}
			>
				{children}
			</SdkDialog>
		</DialogContext.Provider>
	);
}

export type DialogTriggerProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
	controller?: DialogController<unknown, unknown>;
	focusableWhenDisabled?: boolean;
	payload?: unknown;
	shortcut?: string;
};

function DialogTrigger({
	"data-slot": dataSlot = "dialog-trigger",
	asChild,
	children,
	...props
}: DialogTriggerProps & { "data-slot"?: string }) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkTrigger
			data-slot={dataSlot}
			{...props}
			render={(attrs, state) => (
				<Element {...attrs} data-slot={dataSlot} data-state={state.open ? "open" : "closed"}>
					{children}
				</Element>
			)}
		/>
	);
}

export interface DialogPortalProps {
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	children?: React.ReactNode;
}

function DialogPortal({ children }: DialogPortalProps) {
	return <>{children}</>;
}

export type DialogCloseProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
	value?: string;
	action?: (event: Event | undefined, details: ActionDetails) => unknown;
};

function DialogClose({
	"data-slot": dataSlot = "dialog-close",
	asChild,
	children,
	...props
}: DialogCloseProps & { "data-slot"?: string }) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkClose
			data-slot={dataSlot}
			{...props}
			render={(attrs) => (
				<Element {...attrs} data-slot={dataSlot}>
					{children}
				</Element>
			)}
		/>
	);
}

export type DialogOverlayProps = React.ComponentPropsWithRef<"div"> & {
	"data-slot"?: string;
	forceMount?: boolean;
};

function DialogOverlay({
	"data-slot": dataSlot = "dialog-overlay",
	className,
	forceMount: _forceMount,
	...props
}: DialogOverlayProps) {
	return (
		<SdkBackdrop
			data-slot={dataSlot}
			className={cn("cn-dialog-overlay fixed inset-0 isolate z-50", className)}
			{...props}
			render={(attrs, state) => (
				<div {...attrs} data-slot={dataSlot} data-state={state.open ? "open" : "closed"} />
			)}
		/>
	);
}

export type DialogContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> & {
	"data-slot"?: string;
	children?: React.ReactNode;
	asChild?: boolean;
	showCloseButton?: boolean;
	showOverlay?: boolean;
	overlayClassName?: string;
	closeLabel?: string;
	initialFocus?: DialogInitialFocus;
	finalFocus?: DialogFinalFocus;
	keepMounted?: boolean;
	forceMount?: boolean;
	inline?: boolean;
	container?: Element | DocumentFragment | null;
	portalProps?: false | Omit<DialogPortalProps, "children">;
	onOpenAutoFocus?: (event: Event) => void;
	onCloseAutoFocus?: (event: Event) => void;
	onInteractOutside?: (event: Event) => void;
	onPointerDownOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

function DialogContent({
	"data-slot": dataSlot = "dialog-content",
	className,
	children,
	asChild,
	showCloseButton = true,
	showOverlay = true,
	overlayClassName,
	closeLabel = "关闭",
	initialFocus: initialFocusProp,
	finalFocus: finalFocusProp,
	keepMounted,
	forceMount,
	inline: inlineProp,
	container: containerProp,
	portalProps,
	onOpenAutoFocus,
	onCloseAutoFocus,
	onInteractOutside,
	onPointerDownOutside,
	onEscapeKeyDown,
	...props
}: DialogContentProps) {
	const ctx = React.useContext(DialogContext);
	const contentElRef = React.useRef<HTMLElement | null>(null);

	React.useEffect(() => {
		if (!ctx) return;
		ctx.policyRef.current = { onInteractOutside, onPointerDownOutside, onEscapeKeyDown };
		return () => {
			ctx.policyRef.current = {};
		};
	}, [ctx, onInteractOutside, onPointerDownOutside, onEscapeKeyDown]);

	const resolvedInline = inlineProp ?? portalProps === false;
	const resolvedContainer = resolvedInline
		? undefined
		: (containerProp ?? (portalProps ? portalProps.container : undefined) ?? undefined);
	const resolvedKeepMounted =
		keepMounted ?? forceMount ?? (portalProps ? portalProps.forceMount : undefined);

	const resolvedInitialFocus = React.useMemo<DialogInitialFocus | undefined>(() => {
		if (initialFocusProp !== undefined) return initialFocusProp;
		if (!onOpenAutoFocus) return undefined;
		return () => {
			const before = document.activeElement;
			const event = new Event("openAutoFocus", { cancelable: true });
			if (contentElRef.current) {
				Object.defineProperty(event, "target", { value: contentElRef.current });
			}
			onOpenAutoFocus(event);
			if (event.defaultPrevented) {
				if (document.activeElement !== before && document.activeElement instanceof HTMLElement) {
					return document.activeElement;
				}
				return before instanceof HTMLElement ? before : null;
			}
			return (
				contentElRef.current?.querySelector<HTMLElement>(
					'[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
				) ?? undefined
			);
		};
	}, [initialFocusProp, onOpenAutoFocus]);

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
	const Element = asChild ? Slot.Root : "div";

	return (
		<>
			{showOverlay && !resolvedInline && <DialogOverlay className={overlayClassName} />}
			<SdkContent
				initialFocus={resolvedInitialFocus}
				finalFocus={resolvedFinalFocus}
				keepMounted={resolvedKeepMounted}
				inline={resolvedInline}
				container={resolvedContainer}
				data-slot={dataSlot}
				className={cn(
					"cn-dialog-content fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none",
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
						<Element
							{...attrs}
							ref={mergedRef}
							data-slot={dataSlot}
							aria-labelledby={hasExplicitAriaLabel ? undefined : attrs["aria-labelledby"]}
							data-state={state.open ? "open" : "closed"}
						>
							{children}
							{showCloseButton && (
								<DialogClose asChild>
									<Button variant="ghost" className="cn-dialog-close" size="icon-sm">
										<XIcon />
										<span className="sr-only">{closeLabel}</span>
									</Button>
								</DialogClose>
							)}
						</Element>
					);
				}}
			/>
		</>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("cn-dialog-header flex flex-col", className)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	closeLabel = "关闭",
	children,
	...props
}: React.ComponentProps<"div"> & {
	showCloseButton?: boolean;
	closeLabel?: string;
}) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"cn-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogClose asChild>
					<Button variant="outline">{closeLabel}</Button>
				</DialogClose>
			)}
		</div>
	);
}

export type DialogTitleProps = React.ComponentPropsWithRef<"h2"> & {
	asChild?: boolean;
};

function DialogTitle({ className, asChild, children, ...props }: DialogTitleProps) {
	const Element = asChild ? Slot.Root : "h2";
	return (
		<SdkTitle
			data-slot="dialog-title"
			className={cn("cn-dialog-title cn-font-heading", className)}
			{...props}
			render={(attrs) => <Element {...attrs}>{children}</Element>}
		/>
	);
}

export type DialogDescriptionProps = React.ComponentPropsWithRef<"p"> & {
	asChild?: boolean;
};

function DialogDescription({ className, asChild, children, ...props }: DialogDescriptionProps) {
	const Element = asChild ? Slot.Root : "p";
	return (
		<SdkDescription
			data-slot="dialog-description"
			className={cn("cn-dialog-description", className)}
			{...props}
			render={(attrs) => <Element {...attrs}>{children}</Element>}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
