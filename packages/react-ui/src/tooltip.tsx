"use client";

import { cn } from "cn";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import React, {
	cloneElement,
	createContext,
	isValidElement,
	useContext,
	useState,
	type ComponentProps,
	type ReactElement,
	type ReactNode,
} from "react";
import { Kbd, KbdGroup } from "./kbd.tsx";

const ProviderDisabled = createContext(false);
const TooltipDisabled = createContext(false);

export function TooltipProvider({
	delayDuration = 500,
	disabled = false,
	...props
}: ComponentProps<typeof TooltipPrimitive.Provider> & { disabled?: boolean }) {
	return (
		<ProviderDisabled.Provider value={disabled}>
			<TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
		</ProviderDisabled.Provider>
	);
}

export function Tooltip({
	disabled: disabledProp,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	...props
}: ComponentProps<typeof TooltipPrimitive.Root> & { disabled?: boolean }) {
	const providerDisabled = useContext(ProviderDisabled);
	const disabled = disabledProp ?? providerDisabled;
	const [localOpen, setLocalOpen] = useState(defaultOpen);
	return (
		<TooltipDisabled.Provider value={disabled}>
			<TooltipPrimitive.Root
				open={!disabled && (controlledOpen ?? localOpen)}
				onOpenChange={(open) => {
					if (disabled) return;
					if (controlledOpen === undefined) setLocalOpen(open);
					onOpenChange?.(open);
				}}
				{...props}
			/>
		</TooltipDisabled.Provider>
	);
}

export function TooltipTrigger({
	asChild,
	type,
	onFocus,
	onPointerMove,
	...props
}: ComponentProps<typeof TooltipPrimitive.Trigger>) {
	const disabled = useContext(TooltipDisabled);
	return (
		<TooltipPrimitive.Trigger
			data-slot="tooltip-trigger"
			asChild={asChild}
			type={type ?? (asChild ? undefined : "button")}
			onFocus={(event) => {
				onFocus?.(event);
				if (disabled || event.currentTarget.matches(":disabled")) event.preventDefault();
			}}
			onPointerMove={(event) => {
				onPointerMove?.(event);
				if (disabled || event.currentTarget.matches(":disabled")) event.preventDefault();
			}}
			{...props}
		/>
	);
}

export const TooltipPortal = TooltipPrimitive.Portal;

export type TooltipContentProps = ComponentProps<typeof TooltipPrimitive.Content> & {
	appearance?: "default" | "surface";
	arrowClasses?: string;
	portalProps?: false | Omit<ComponentProps<typeof TooltipPortal>, "children">;
};

export function TooltipContent({
	className,
	appearance = "default",
	side = "top",
	sideOffset = 6,
	collisionPadding = 8,
	arrowClasses,
	portalProps,
	forceMount,
	asChild,
	children,
	...props
}: TooltipContentProps) {
	const disabled = useContext(TooltipDisabled);
	if (disabled) return null;
	const arrow = appearance === "default" && arrowClasses !== undefined && (
		<TooltipPrimitive.Arrow
			data-slot="tooltip-arrow"
			className={cn("fill-foreground", arrowClasses)}
			aria-hidden="true"
		/>
	);
	const content = (
		<TooltipPrimitive.Content
			data-slot="tooltip-content"
			data-appearance={appearance}
			className={cn(
				"cn-tooltip-content cn-overlay-surface z-50 w-fit max-w-[min(20rem,calc(100vw-1rem),var(--radix-tooltip-content-available-width,100vw))] origin-(--radix-tooltip-content-transform-origin) wrap-anywhere [&>*]:min-w-0",
				appearance === "surface" && "animate-none!",
				className
			)}
			side={side}
			sideOffset={sideOffset}
			collisionPadding={collisionPadding}
			forceMount={forceMount}
			asChild={asChild}
			{...props}
		>
			{asChild ? (
				arrow && isValidElement<{ children?: ReactNode }>(children) ? (
					cloneElement(children, {}, children.props.children, arrow)
				) : (
					children
				)
			) : (
				<>
					{children}
					{arrow}
				</>
			)}
		</TooltipPrimitive.Content>
	);
	return portalProps === false ? (
		content
	) : (
		<TooltipPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</TooltipPortal>
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
	children: ReactElement;
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
