"use client";

import * as React from "react";
import {
	HoverCard as SdkHoverCard,
	HoverCardContent as SdkContent,
	HoverCardTrigger as SdkTrigger,
	createHoverCardController,
	type HoverCardController,
	type HoverCardOpenChangeReason,
} from "@ui-sdk/react/hover-card";
import type { Anchor, ChangeDetails, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { Slot } from "radix-ui";

type HoverCardPointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent | Event }>;

interface HoverCardDismissCallbacks {
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
	onPointerDownOutside?: (event: HoverCardPointerDownOutsideEvent) => void;
}

const HoverCardFocusContext = React.createContext<{
	controller: HoverCardController<unknown>;
	disabled: boolean;
	pointerDownRef: React.MutableRefObject<boolean>;
	lastDismissedAtRef: React.MutableRefObject<number>;
	dismissRef: React.MutableRefObject<HoverCardDismissCallbacks>;
} | null>(null);

export interface HoverCardProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<HoverCardOpenChangeReason>) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	openDelay?: number;
	delay?: number;
	closeDelay?: number;
	disabled?: boolean;
	controller?: HoverCardController<unknown>;
	container?: Element | DocumentFragment | null;
	children?: React.ReactNode;
}

export function HoverCard({
	open,
	defaultOpen,
	onOpenChange,
	onOpenChangeComplete,
	openDelay,
	delay,
	closeDelay,
	disabled,
	controller,
	container,
	children,
}: HoverCardProps) {
	const internalControllerRef = React.useRef<HoverCardController<unknown> | null>(null);
	if (!internalControllerRef.current) {
		internalControllerRef.current = createHoverCardController();
	}
	const resolvedController = controller ?? internalControllerRef.current;
	const pointerDownRef = React.useRef(false);
	const lastDismissedAtRef = React.useRef(-Infinity);
	const dismissRef = React.useRef<HoverCardDismissCallbacks>({});
	const focusContext = React.useMemo(
		() => ({
			controller: resolvedController,
			disabled: Boolean(disabled),
			pointerDownRef,
			lastDismissedAtRef,
			dismissRef,
		}),
		[resolvedController, disabled]
	);

	function handleOpenChange(next: boolean, details: ChangeDetails<HoverCardOpenChangeReason>) {
		if (!next) {
			if (details.reason === "escape-key" && dismissRef.current.onEscapeKeyDown) {
				const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
				dismissRef.current.onEscapeKeyDown(event);
				if (event.defaultPrevented) {
					details.cancel();
					return;
				}
			}
			if (details.reason === "outside-press" && dismissRef.current.onPointerDownOutside) {
				const event = new CustomEvent("pointerDownOutside", {
					cancelable: true,
					detail: { originalEvent: details.event ?? new Event("pointerdown") },
				}) as HoverCardPointerDownOutsideEvent;
				dismissRef.current.onPointerDownOutside(event);
				if (event.defaultPrevented) {
					details.cancel();
					return;
				}
			}
		}
		onOpenChange?.(next, details);
		if (!next && !details.canceled && details.reason === "escape-key") {
			lastDismissedAtRef.current = performance.now();
			details.event?.stopPropagation();
		}
	}

	return (
		<HoverCardFocusContext.Provider value={focusContext}>
			<SdkHoverCard
				open={open}
				defaultOpen={defaultOpen}
				delay={delay ?? openDelay}
				closeDelay={closeDelay}
				disabled={disabled}
				controller={resolvedController}
				container={container}
				onOpenChange={handleOpenChange}
				onOpenChangeComplete={onOpenChangeComplete}
			>
				{children}
			</SdkHoverCard>
		</HoverCardFocusContext.Provider>
	);
}

export interface HoverCardPortalProps {
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	children?: React.ReactNode;
}

export function HoverCardPortal({ children }: HoverCardPortalProps) {
	return <>{children}</>;
}

export type HoverCardTriggerProps = React.ComponentPropsWithRef<"a"> & {
	asChild?: boolean;
	payload?: unknown;
	controller?: HoverCardController<unknown>;
};

export function HoverCardTrigger({
	className,
	asChild,
	payload,
	controller,
	onPointerDown,
	onFocus,
	children,
	...props
}: HoverCardTriggerProps) {
	const focusCtx = React.useContext(HoverCardFocusContext);
	return (
		<SdkTrigger
			payload={payload}
			controller={controller}
			className={cn(
				"focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring",
				className
			)}
			onPointerDown={(event) => {
				if (focusCtx) {
					focusCtx.pointerDownRef.current = true;
					queueMicrotask(() => {
						focusCtx.pointerDownRef.current = false;
					});
				}
				onPointerDown?.(event);
			}}
			onFocus={(event) => {
				onFocus?.(event);
				const target = event.currentTarget;
				if (
					focusCtx &&
					!focusCtx.disabled &&
					!focusCtx.pointerDownRef.current &&
					performance.now() - focusCtx.lastDismissedAtRef.current >= 200
				) {
					queueMicrotask(() => {
						if (
							document.activeElement === target &&
							!focusCtx.controller.isOpen() &&
							performance.now() - focusCtx.lastDismissedAtRef.current >= 200
						) {
							void focusCtx.controller.open();
						}
					});
				}
			}}
			{...props}
			render={(partProps, state) => {
				const finalProps = {
					...partProps,
					"data-slot": "hover-card-trigger",
					"data-state": state.open ? "open" : "closed",
				};
				if (asChild) {
					return <Slot.Root {...finalProps}>{children}</Slot.Root>;
				}
				return <a {...finalProps}>{children}</a>;
			}}
		/>
	);
}

export type HoverCardContentProps = React.ComponentPropsWithRef<"div"> & {
	appearance?: "default" | "profile";
	side?: Side;
	align?: "start" | "center" | "end";
	sideOffset?: number;
	alignOffset?: number;
	collisionPadding?: number;
	arrowPadding?: number;
	anchor?: Anchor | string | null;
	portalProps?: false | Omit<HoverCardPortalProps, "children">;
	inline?: boolean;
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	keepMounted?: boolean;
	avoidCollisions?: boolean;
	asChild?: boolean;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
	onPointerDownOutside?: (event: HoverCardPointerDownOutsideEvent) => void;
};

export function HoverCardContent({
	className,
	style,
	appearance = "default",
	side = "bottom",
	sideOffset = 4,
	align = "center",
	alignOffset = 0,
	collisionPadding = 8,
	arrowPadding,
	anchor,
	portalProps,
	inline: inlineProp,
	container: containerProp,
	forceMount,
	keepMounted,
	avoidCollisions: _avoidCollisions,
	asChild,
	onEscapeKeyDown,
	onPointerDownOutside,
	children,
	...props
}: HoverCardContentProps) {
	const focusCtx = React.useContext(HoverCardFocusContext);
	React.useEffect(() => {
		if (!focusCtx) return;
		focusCtx.dismissRef.current = { onEscapeKeyDown, onPointerDownOutside };
		return () => {
			focusCtx.dismissRef.current = {};
		};
	}, [focusCtx, onEscapeKeyDown, onPointerDownOutside]);
	const resolvedInline = inlineProp ?? portalProps === false;
	const resolvedContainer = resolvedInline
		? undefined
		: (containerProp ?? (typeof portalProps === "object" ? portalProps.container : undefined));
	const resolvedKeepMounted =
		keepMounted ?? forceMount ?? (typeof portalProps === "object" ? portalProps.forceMount : undefined);

	return (
		<SdkContent
			side={side}
			align={align}
			sideOffset={sideOffset}
			alignOffset={alignOffset}
			collisionPadding={collisionPadding}
			arrowPadding={arrowPadding}
			anchor={anchor}
			container={resolvedContainer}
			keepMounted={resolvedKeepMounted}
			className={cn(
				"cn-hover-card-content z-50 origin-(--transform-origin) outline-hidden [--bits-link-preview-content-available-height:var(--available-height)] [--bits-link-preview-content-available-width:var(--available-width)]",
				appearance === "profile" && "cn-hover-card-profile",
				className
			)}
			style={{
				"--radix-hover-card-content-available-height": "var(--available-height)",
				"--radix-hover-card-content-available-width": "var(--available-width)",
				"--radix-hover-card-content-transform-origin": "var(--transform-origin)",
				...style,
			} as React.CSSProperties}
			{...props}
			render={(partProps, state) => {
				const resolvedSide = (partProps as Record<string, unknown>)["data-side"] ?? side;
				const resolvedAlign = (partProps as Record<string, unknown>)["data-align"] ?? align;
				const finalProps = {
					...partProps,
					"data-slot": "hover-card-content",
					"data-appearance": appearance,
					"data-side": resolvedSide as string,
					"data-align": resolvedAlign as string,
					"data-state": state.open ? "open" : "closed",
				};
				if (asChild) {
					return <Slot.Root {...finalProps}>{children}</Slot.Root>;
				}
				return <div {...finalProps}>{children}</div>;
			}}
		/>
	);
}
