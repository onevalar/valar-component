"use client";

import * as React from "react";
import {
	Tooltip as SdkTooltip,
	TooltipArrow as SdkArrow,
	TooltipContent as SdkContent,
	TooltipTrigger as SdkTrigger,
	createTooltipController,
	type TooltipController,
	type TooltipOpenChangeReason,
} from "@ui-sdk/react/tooltip";
import type { Anchor, ChangeDetails, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { Slot } from "radix-ui";
import { Kbd, KbdGroup } from "./kbd.tsx";

type TooltipProviderConfig = {
	delayDuration: number;
	disabled: boolean;
};

const ProviderContext = React.createContext<TooltipProviderConfig>({
	delayDuration: 500,
	disabled: false,
});

const TooltipDisabledContext = React.createContext(false);
const TooltipFocusContext = React.createContext<{
	controller: TooltipController<unknown>;
	pointerDownRef: React.MutableRefObject<boolean>;
	lastDismissedAtRef: React.MutableRefObject<number>;
} | null>(null);

export interface TooltipProviderProps {
	delayDuration?: number;
	skipDelayDuration?: number;
	disableHoverableContent?: boolean;
	disabled?: boolean;
	children?: React.ReactNode;
}

export function TooltipProvider({
	delayDuration = 500,
	disabled = false,
	children,
}: TooltipProviderProps) {
	const value = React.useMemo(
		() => ({ delayDuration, disabled }),
		[delayDuration, disabled]
	);
	return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

export interface TooltipProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<TooltipOpenChangeReason>) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	delayDuration?: number;
	delay?: number;
	closeDelay?: number;
	disableHoverableContent?: boolean;
	disabled?: boolean;
	toggleable?: boolean;
	closeOnPress?: boolean;
	type?: "label" | "description";
	shortcut?: string;
	controller?: TooltipController<unknown>;
	container?: Element | DocumentFragment | null;
	children?: React.ReactNode;
}

export function Tooltip({
	disabled: disabledProp,
	delayDuration,
	delay,
	closeDelay,
	disableHoverableContent: _disableHoverableContent,
	open,
	defaultOpen = false,
	onOpenChange,
	onOpenChangeComplete,
	toggleable,
	closeOnPress,
	type,
	shortcut,
	controller,
	container,
	children,
}: TooltipProps) {
	const provider = React.useContext(ProviderContext);
	const disabled = disabledProp ?? provider.disabled;
	const resolvedDelay = delay ?? delayDuration ?? provider.delayDuration;
	const internalControllerRef = React.useRef<TooltipController<unknown> | null>(null);
	if (!internalControllerRef.current) {
		internalControllerRef.current = createTooltipController();
	}
	const resolvedController = controller ?? internalControllerRef.current;
	const pointerDownRef = React.useRef(false);
	const lastDismissedAtRef = React.useRef(-Infinity);
	const focusContext = React.useMemo(
		() => ({ controller: resolvedController, pointerDownRef, lastDismissedAtRef }),
		[resolvedController]
	);

	function handleOpenChange(next: boolean, details: ChangeDetails<TooltipOpenChangeReason>) {
		if (disabled && next) {
			details.cancel();
			return;
		}
		onOpenChange?.(next, details);
		if (!next && !details.canceled && details.reason === "escape-key") {
			lastDismissedAtRef.current = performance.now();
			details.event?.stopPropagation();
		}
	}

	return (
		<TooltipDisabledContext.Provider value={disabled}>
			<TooltipFocusContext.Provider value={focusContext}>
				<SdkTooltip
					open={disabled ? false : open}
					defaultOpen={disabled ? false : defaultOpen}
					delay={resolvedDelay}
					closeDelay={closeDelay}
					disabled={disabled}
					toggleable={toggleable}
					closeOnPress={closeOnPress}
					type={type}
					shortcut={shortcut}
					controller={resolvedController}
					container={container}
					onOpenChange={handleOpenChange}
					onOpenChangeComplete={onOpenChangeComplete}
				>
					{children}
				</SdkTooltip>
			</TooltipFocusContext.Provider>
		</TooltipDisabledContext.Provider>
	);
}

export type TooltipTriggerProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
	payload?: unknown;
	controller?: TooltipController<unknown>;
};

export function TooltipTrigger({
	asChild,
	type,
	payload,
	controller,
	onFocus,
	onPointerDown,
	onPointerMove,
	children,
	...props
}: TooltipTriggerProps) {
	const disabled = React.useContext(TooltipDisabledContext);
	const focusCtx = React.useContext(TooltipFocusContext);
	return (
		<SdkTrigger
			payload={payload}
			controller={controller}
			{...props}
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
				if (disabled || event.currentTarget.matches(":disabled")) {
					event.preventDefault();
					return;
				}
				const target = event.currentTarget;
				if (
					focusCtx &&
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
			onPointerMove={(event) => {
				onPointerMove?.(event);
				if (disabled || event.currentTarget.matches(":disabled")) event.preventDefault();
			}}
			render={(partProps, state) => {
				const { type: partType, ...restPart } = partProps;
				const resolvedType = type ?? (asChild ? undefined : (partType ?? "button"));
				const stateAttr = state.open ? "open" : "closed";
				if (asChild) {
					return (
						<Slot.Root
							{...restPart}
							data-slot="tooltip-trigger"
							data-state={stateAttr}
							{...(resolvedType !== undefined ? { type: resolvedType } : {})}
						>
							{children}
						</Slot.Root>
					);
				}
				return (
					<button
						{...restPart}
						data-slot="tooltip-trigger"
						type={resolvedType}
						data-state={stateAttr}
					>
						{children}
					</button>
				);
			}}
		/>
	);
}

export interface TooltipPortalProps {
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	children?: React.ReactNode;
}

export function TooltipPortal({ children }: TooltipPortalProps) {
	return <>{children}</>;
}

export type TooltipContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> & {
	appearance?: "default" | "surface";
	side?: Side;
	align?: "start" | "center" | "end";
	sideOffset?: number;
	alignOffset?: number;
	collisionPadding?: number;
	arrowPadding?: number;
	anchor?: Anchor | string | null;
	arrowClasses?: string;
	portalProps?: false | Omit<TooltipPortalProps, "children">;
	inline?: boolean;
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	avoidCollisions?: boolean;
	asChild?: boolean;
	children?: React.ReactNode;
};

export function TooltipContent({
	className,
	style,
	appearance = "default",
	side = "top",
	align = "center",
	sideOffset = 6,
	alignOffset = 0,
	collisionPadding = 8,
	arrowPadding,
	anchor,
	arrowClasses,
	portalProps,
	inline: inlineProp,
	container: containerProp,
	forceMount: _forceMount,
	avoidCollisions: _avoidCollisions,
	asChild,
	hidden,
	children,
	...props
}: TooltipContentProps) {
	const disabled = React.useContext(TooltipDisabledContext);
	if (disabled || hidden) return null;

	const resolvedInline = inlineProp ?? portalProps === false;
	const resolvedContainer = resolvedInline
		? undefined
		: (containerProp ?? (typeof portalProps === "object" ? portalProps.container : undefined));

	const arrow =
		appearance === "default" && arrowClasses !== undefined ? (
			<SdkArrow
				render={(arrowPart) => (
					<div
						{...arrowPart}
						data-slot="tooltip-arrow"
						aria-hidden="true"
						className={cn("cn-tooltip-arrow fill-foreground bg-foreground", arrowClasses)}
					/>
				)}
			/>
		) : null;

	const contentBody = asChild ? (
		arrow && React.isValidElement<{ children?: React.ReactNode }>(children) ? (
			React.cloneElement(children, {}, children.props.children, arrow)
		) : (
			children
		)
	) : (
		<>
			{children}
			{arrow}
		</>
	);

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
			className={cn(
				"cn-tooltip-content cn-overlay-surface z-50 w-fit max-w-[min(20rem,calc(100vw-1rem),var(--available-width,100vw))] origin-(--transform-origin) wrap-anywhere [&>*]:min-w-0",
				appearance === "surface" && "animate-none!",
				className
			)}
			style={{
				"--radix-tooltip-content-available-width": "var(--available-width)",
				"--radix-tooltip-content-available-height": "var(--available-height)",
				"--radix-tooltip-content-transform-origin": "var(--transform-origin)",
				...style,
			} as React.CSSProperties}
			{...props}
			render={(partProps, state) => {
				const { role, "data-slot": _sdkSlot, ...restPart } = partProps as Record<string, unknown>;
				const resolvedSide = (partProps as Record<string, unknown>)["data-side"] ?? side;
				const resolvedAlign = (partProps as Record<string, unknown>)["data-align"] ?? align;
				const resolvedState = state.open ? "open" : "closed";
				const isHidden = partProps.hidden !== undefined && partProps.hidden !== false;
				const finalProps = {
					...restPart,
					role: (role as string | undefined) ?? "tooltip",
					"data-slot": isHidden ? undefined : "tooltip-content",
					"data-appearance": appearance,
					"data-side": resolvedSide as string,
					"data-align": resolvedAlign as string,
					"data-state": resolvedState,
				};
				if (asChild) {
					return <Slot.Root {...finalProps}>{contentBody}</Slot.Root>;
				}
				return <div {...finalProps}>{contentBody}</div>;
			}}
		/>
	);
}

export function TooltipHint({
	label,
	keys = [],
	side = "bottom",
	portalProps,
	disabled,
	children,
}: {
	label: string;
	keys?: readonly string[];
	side?: TooltipContentProps["side"];
	portalProps?: TooltipContentProps["portalProps"];
	disabled?: boolean;
	children: React.ReactElement;
}) {
	return (
		<Tooltip disabled={disabled} disableHoverableContent>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent appearance="surface" side={side} portalProps={portalProps}>
				<span className="min-w-0">{label}</span>
				{keys.length > 0 && (
					<KbdGroup className="shrink-0">
						{keys.map((key, index) => (
							<Kbd key={index} appearance="compact">
								{key}
							</Kbd>
						))}
					</KbdGroup>
				)}
			</TooltipContent>
		</Tooltip>
	);
}
