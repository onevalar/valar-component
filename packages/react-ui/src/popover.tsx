"use client";

import * as React from "react";
import {
	Popover as SdkPopover,
	PopoverClose as SdkClose,
	PopoverContent as SdkContent,
	PopoverTrigger as SdkTrigger,
	type PopoverController,
	type PopoverDismissReason,
	type PopoverFinalFocus,
	type PopoverInitialFocus,
	type PopoverOpenChangeReason,
} from "@ui-sdk/react/popover";
import type { Anchor, ChangeDetails, DismissAttemptDetails, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { Slot } from "radix-ui";

type PopoverDismissPolicy = {
	onInteractOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

const PopoverContext = React.createContext<{
	anchor: HTMLElement | null;
	setAnchor: (el: HTMLElement | null) => void;
	policyRef: React.MutableRefObject<PopoverDismissPolicy>;
} | null>(null);

export interface PopoverProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<PopoverOpenChangeReason>) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	modal?: boolean | "trap-focus";
	openOnHover?: boolean;
	delay?: number;
	closeDelay?: number;
	presentation?: "auto" | "popover" | "sheet";
	controller?: PopoverController<unknown>;
	dismissible?: boolean;
	onDismissAttempt?: (details: DismissAttemptDetails<PopoverDismissReason>) => void;
	container?: Element | DocumentFragment | null;
	children?: React.ReactNode;
}

function Popover({ onOpenChange, children, ...props }: PopoverProps) {
	const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
	const policyRef = React.useRef<PopoverDismissPolicy>({});

	const contextValue = React.useMemo(
		() => ({ anchor, setAnchor, policyRef }),
		[anchor]
	);

	function handleOpenChange(next: boolean, details: ChangeDetails<PopoverOpenChangeReason>) {
		if (!next) {
			if (details.reason === "outside-press" && policyRef.current.onInteractOutside) {
				const event = new CustomEvent("interactOutside", {
					cancelable: true,
					detail: { originalEvent: details.event },
				});
				policyRef.current.onInteractOutside(event);
				if (event.defaultPrevented) {
					details.cancel();
					return;
				}
			}
			if (details.reason === "escape-key" && policyRef.current.onEscapeKeyDown) {
				const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
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
		<PopoverContext.Provider value={contextValue}>
			<SdkPopover {...props} onOpenChange={handleOpenChange}>
				{children}
			</SdkPopover>
		</PopoverContext.Provider>
	);
}

export type PopoverTriggerProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
	controller?: PopoverController<unknown>;
	focusableWhenDisabled?: boolean;
	payload?: unknown;
	shortcut?: string;
};

function PopoverTrigger({ asChild, children, ...props }: PopoverTriggerProps) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkTrigger
			data-slot="popover-trigger"
			{...props}
			render={(attrs, state) => (
				<Element {...attrs} data-state={state.open ? "open" : "closed"}>
					{children}
				</Element>
			)}
		/>
	);
}

export interface PopoverPortalProps {
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	children?: React.ReactNode;
}

function PopoverPortal({ children }: PopoverPortalProps) {
	return <>{children}</>;
}

export type PopoverContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> & {
	"data-slot"?: string;
	children?: React.ReactNode;
	asChild?: boolean;
	appearance?: "default" | "surface" | "options";
	side?: Side;
	align?: "start" | "center" | "end";
	sideOffset?: number;
	alignOffset?: number;
	collisionPadding?: number;
	arrowPadding?: number;
	anchor?: Anchor | string | null;
	initialFocus?: PopoverInitialFocus;
	finalFocus?: PopoverFinalFocus;
	keepMounted?: boolean;
	forceMount?: boolean;
	inline?: boolean;
	container?: Element | DocumentFragment | null;
	portalProps?: false | Omit<PopoverPortalProps, "children">;
	onOpenAutoFocus?: (event: Event) => void;
	onCloseAutoFocus?: (event: Event) => void;
	onInteractOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
	avoidCollisions?: boolean;
};

function PopoverContent({
	"data-slot": dataSlot = "popover-content",
	className,
	style,
	children,
	asChild,
	side = "bottom",
	align = "center",
	sideOffset = 4,
	alignOffset = 0,
	collisionPadding = 8,
	arrowPadding,
	appearance = "default",
	portalProps,
	container: containerProp,
	inline: inlineProp,
	forceMount,
	keepMounted,
	anchor: anchorProp,
	initialFocus: initialFocusProp,
	finalFocus: finalFocusProp,
	onOpenAutoFocus,
	onCloseAutoFocus,
	onInteractOutside,
	onEscapeKeyDown,
	avoidCollisions: _avoidCollisions,
	...props
}: PopoverContentProps) {
	const ctx = React.useContext(PopoverContext);

	React.useEffect(() => {
		if (!ctx) return;
		ctx.policyRef.current = { onInteractOutside, onEscapeKeyDown };
		return () => {
			ctx.policyRef.current = {};
		};
	}, [ctx, onInteractOutside, onEscapeKeyDown]);

	const resolvedInline = inlineProp ?? portalProps === false;
	const resolvedContainer = resolvedInline
		? undefined
		: (containerProp ?? (portalProps ? portalProps.container : undefined) ?? undefined);
	const resolvedKeepMounted =
		keepMounted ?? forceMount ?? (portalProps ? portalProps.forceMount : undefined);
	const resolvedAnchor = anchorProp ?? ctx?.anchor ?? undefined;

	const contentElRef = React.useRef<HTMLElement | null>(null);

	const resolvedInitialFocus = React.useMemo<PopoverInitialFocus | undefined>(() => {
		if (initialFocusProp !== undefined) return initialFocusProp;
		if (!onOpenAutoFocus) return undefined;
		return () => {
			const event = new Event("openAutoFocus", { cancelable: true });
			onOpenAutoFocus(event);
			if (event.defaultPrevented) {
				return document.activeElement instanceof HTMLElement ? document.activeElement : null;
			}
			return (
				contentElRef.current?.querySelector<HTMLElement>(
					'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
				) ?? undefined
			);
		};
	}, [initialFocusProp, onOpenAutoFocus]);

	const resolvedFinalFocus = React.useMemo<PopoverFinalFocus | undefined>(() => {
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
		<SdkContent
			side={side}
			align={align}
			sideOffset={sideOffset}
			alignOffset={alignOffset}
			collisionPadding={collisionPadding}
			arrowPadding={arrowPadding}
			anchor={resolvedAnchor}
			initialFocus={resolvedInitialFocus}
			finalFocus={resolvedFinalFocus}
			keepMounted={resolvedKeepMounted}
			inline={resolvedInline}
			container={resolvedContainer}
			data-slot={dataSlot}
			data-appearance={appearance}
			className={cn(
				"cn-popover-content cn-overlay-surface cn-popover-viewport z-50 origin-(--transform-origin) outline-hidden",
				appearance === "options" ? "w-[330px]" : "w-72",
				appearance === "surface" && "cn-overlay-menu-rows animate-none!",
				appearance === "options" && "cn-popover-options animate-none!",
				className
			)}
			style={
				{
					"--radix-popover-content-available-height": "var(--available-height)",
					"--radix-popover-content-available-width": "var(--available-width)",
					"--radix-popover-content-transform-origin": "var(--transform-origin)",
					...style,
				} as React.CSSProperties
			}
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
						aria-labelledby={hasExplicitAriaLabel ? undefined : attrs["aria-labelledby"]}
						data-slot={dataSlot}
						data-side={(attrs["data-side"] as string | undefined) ?? side}
						data-align={(attrs["data-align"] as string | undefined) ?? align}
						data-state={state.open ? "open" : "closed"}
					>
						{children}
					</Element>
				);
			}}
		/>
	);
}

export type PopoverCloseProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
};

function PopoverClose({ asChild, children, ...props }: PopoverCloseProps) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkClose
			data-slot="popover-close"
			{...props}
			render={(attrs) => <Element {...attrs}>{children}</Element>}
		/>
	);
}

export type PopoverAnchorProps = React.ComponentPropsWithRef<"div"> & {
	asChild?: boolean;
};

function PopoverAnchor({ asChild, ref, ...props }: PopoverAnchorProps) {
	const ctx = React.useContext(PopoverContext);
	const Element = asChild ? Slot.Root : "div";
	const mergedRef = React.useCallback(
		(node: HTMLDivElement | null) => {
			ctx?.setAnchor(node);
			if (typeof ref === "function") ref(node);
			else if (ref && "current" in ref)
				(ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
		},
		[ctx, ref]
	);
	return <Element ref={mergedRef} data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-slot="popover-header" className={cn("cn-popover-header", className)} {...props} />
	);
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="popover-title" className={cn("cn-popover-title", className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="popover-description"
			className={cn("cn-popover-description", className)}
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverAnchor,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverPortal,
	PopoverTitle,
	PopoverTrigger,
};
