"use client";

import * as React from "react";
import {
	Menu as SdkMenu,
	MenuCheckboxItem as SdkCheckboxItem,
	MenuContent as SdkContent,
	MenuContextTrigger as SdkContextTrigger,
	MenuGroup as SdkGroup,
	MenuGroupLabel as SdkGroupLabel,
	MenuItem as SdkItem,
	MenuRadioGroup as SdkRadioGroup,
	MenuRadioItem as SdkRadioItem,
	MenuSub as SdkSub,
	MenuSubContent as SdkSubContent,
	MenuSubTrigger as SdkSubTrigger,
	type MenuActionDetails,
	type MenuCheckedChangeDetails,
	type MenuCheckedChangeReason,
	type MenuController,
	type MenuDismissReason,
	type MenuFinalFocus,
	type MenuOpenChangeReason,
	type MenuValueChangeDetails,
	type MenuValueChangeReason,
} from "@ui-sdk/react/menu";
import type { Anchor, ChangeDetails, DismissAttemptDetails, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { Kbd } from "./kbd.tsx";
import { Separator } from "./separator.tsx";

type MenuDismissPolicy = {
	onInteractOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

const MenuPolicyContext = React.createContext<React.MutableRefObject<MenuDismissPolicy> | null>(
	null
);
const InMenuGroupContext = React.createContext(false);

function skipDisabledMenuItems(menuEl: HTMLElement | null, key: string) {
	if (!menuEl) return;
	const step =
		key === "ArrowDown" || key === "Home" || key === "PageUp"
			? 1
			: key === "ArrowUp" || key === "End" || key === "PageDown"
				? -1
				: 0;
	if (!step) return;
	queueMicrotask(() => {
		const active = document.activeElement as HTMLElement | null;
		if (!active || !menuEl.contains(active) || active.getAttribute("aria-disabled") !== "true") {
			return;
		}
		const items = [
			...menuEl.querySelectorAll<HTMLElement>(
				'[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'
			),
		].filter((item) => item.closest('[role="menu"]') === menuEl);
		const start = items.indexOf(active);
		if (start === -1 || items.length < 2) return;
		for (let offset = 1; offset < items.length; offset++) {
			const candidate = items[(start + offset * step + items.length) % items.length];
			if (candidate.getAttribute("aria-disabled") !== "true") {
				candidate.focus({ preventScroll: true });
				return;
			}
		}
	});
}

export interface ContextMenuProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<MenuOpenChangeReason>) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	onAction?: (value: string, details: MenuActionDetails) => unknown;
	onCheckedChange?: (checked: boolean, details: MenuCheckedChangeDetails) => void;
	onValueChange?: (value: string, details: MenuValueChangeDetails) => void;
	onDismissAttempt?: (details: DismissAttemptDetails<MenuDismissReason>) => void;
	modal?: boolean | "pointer";
	loop?: boolean;
	delay?: number;
	dismissible?: boolean;
	controller?: MenuController<unknown>;
	container?: Element | DocumentFragment | null;
	dir?: "ltr" | "rtl";
	children?: React.ReactNode;
}

export function ContextMenu({
	open,
	defaultOpen,
	onOpenChange,
	onOpenChangeComplete,
	onAction,
	onCheckedChange,
	onValueChange,
	onDismissAttempt,
	modal,
	loop,
	delay,
	dismissible,
	controller,
	container,
	children,
}: ContextMenuProps) {
	const policyRef = React.useRef<MenuDismissPolicy>({});

	function handleOpenChange(next: boolean, details: ChangeDetails<MenuOpenChangeReason>) {
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
		<MenuPolicyContext.Provider value={policyRef}>
			<SdkMenu
				open={open}
				defaultOpen={defaultOpen}
				modal={modal}
				loop={loop}
				delay={delay}
				presentation="popover"
				dismissible={dismissible}
				controller={controller}
				container={container}
				onOpenChange={handleOpenChange}
				onOpenChangeComplete={onOpenChangeComplete}
				onAction={onAction}
				onCheckedChange={onCheckedChange}
				onValueChange={onValueChange}
				onDismissAttempt={onDismissAttempt}
			>
				{children}
			</SdkMenu>
		</MenuPolicyContext.Provider>
	);
}

export interface ContextMenuPortalProps {
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	children?: React.ReactNode;
}

export function ContextMenuPortal({ children }: ContextMenuPortalProps) {
	return <>{children}</>;
}

type PortalProps = {
	portalProps?: false | Omit<ContextMenuPortalProps, "children">;
};

export type ContextMenuTriggerProps = React.ComponentPropsWithRef<"div"> & {
	asChild?: boolean;
	disabled?: boolean;
	payload?: unknown;
	controller?: MenuController<unknown>;
};

export function ContextMenuTrigger({
	className,
	asChild,
	onKeyDown,
	disabled,
	payload,
	controller,
	children,
	...props
}: ContextMenuTriggerProps) {
	return (
		<SdkContextTrigger
			disabled={disabled}
			payload={payload}
			controller={controller}
			className={cn(
				"select-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring",
				className
			)}
			onKeyDown={(event) => {
				onKeyDown?.(event);
				if (
					event.defaultPrevented ||
					event.nativeEvent.isComposing ||
					disabled ||
					event.target !== event.currentTarget ||
					!(event.key === "ContextMenu" || (event.shiftKey && event.key === "F10"))
				)
					return;
				event.preventDefault();
				const target = event.currentTarget;
				const bounds = target.getBoundingClientRect();
				// button: 0 lets @ui-sdk/core recognize a keyboard contextmenu and focus the first item.
				target.dispatchEvent(
					new MouseEvent("contextmenu", {
						bubbles: true,
						cancelable: true,
						button: 0,
						clientX: bounds.left + Math.min(16, bounds.width / 2),
						clientY: bounds.bottom - Math.min(8, bounds.height / 2),
					})
				);
			}}
			{...props}
			render={(partProps, state) => {
				const finalProps = {
					...partProps,
					"data-slot": "context-menu-trigger",
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

export type ContextMenuContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> &
	PortalProps & {
		side?: Side;
		align?: "start" | "center" | "end";
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
		arrowPadding?: number;
		anchor?: Anchor | string | null;
		finalFocus?: MenuFinalFocus;
		keepMounted?: boolean;
		forceMount?: boolean;
		container?: Element | DocumentFragment | null;
		avoidCollisions?: boolean;
		onInteractOutside?: (event: Event) => void;
		onEscapeKeyDown?: (event: KeyboardEvent) => void;
		onCloseAutoFocus?: (event: Event) => void;
		asChild?: boolean;
		children?: React.ReactNode;
	};

export function ContextMenuContent({
	className,
	style,
	side,
	align = "start",
	sideOffset,
	alignOffset,
	collisionPadding = 8,
	arrowPadding,
	anchor,
	finalFocus: finalFocusProp,
	portalProps,
	container: containerProp,
	forceMount,
	keepMounted,
	avoidCollisions: _avoidCollisions,
	onInteractOutside,
	onEscapeKeyDown,
	onCloseAutoFocus,
	asChild,
	children,
	...props
}: ContextMenuContentProps) {
	const policyRef = React.useContext(MenuPolicyContext);
	React.useEffect(() => {
		if (!policyRef) return;
		policyRef.current = { onInteractOutside, onEscapeKeyDown };
		return () => {
			policyRef.current = {};
		};
	}, [policyRef, onInteractOutside, onEscapeKeyDown]);

	const resolvedContainer =
		portalProps === false
			? undefined
			: (containerProp ?? (typeof portalProps === "object" ? portalProps.container : undefined));
	const resolvedKeepMounted =
		keepMounted ?? forceMount ?? (typeof portalProps === "object" ? portalProps.forceMount : undefined);

	const resolvedFinalFocus = React.useMemo<MenuFinalFocus | undefined>(() => {
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
		<SdkContent
			side={side}
			align={align}
			sideOffset={sideOffset}
			alignOffset={alignOffset}
			collisionPadding={collisionPadding}
			arrowPadding={arrowPadding}
			anchor={anchor}
			finalFocus={resolvedFinalFocus}
			keepMounted={resolvedKeepMounted}
			container={resolvedContainer}
			className={cn(
				"cn-context-menu-content cn-overlay-surface cn-context-menu-surface z-50 max-h-(--available-height) max-w-[min(var(--available-width,100dvw),calc(100dvw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden [--bits-floating-available-width:var(--available-width)]",
				className
			)}
			style={{
				"--radix-context-menu-content-available-height": "var(--available-height)",
				"--radix-context-menu-content-available-width": "var(--available-width)",
				"--radix-context-menu-content-transform-origin": "var(--transform-origin)",
				...style,
			} as React.CSSProperties}
			{...props}
			onKeyDown={(event) => {
				props.onKeyDown?.(event);
				skipDisabledMenuItems(event.currentTarget, event.key);
			}}
			render={(partProps, state) => {
				const resolvedSide = (partProps as Record<string, unknown>)["data-side"] ?? side ?? "bottom";
				const resolvedAlign = (partProps as Record<string, unknown>)["data-align"] ?? align;
				const finalProps = {
					...partProps,
					...(hasExplicitAriaLabel ? { "aria-labelledby": undefined } : {}),
					"data-slot": "context-menu-content",
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

export function ContextMenuGroup({ children, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<InMenuGroupContext.Provider value={true}>
			<SdkGroup
				{...props}
				render={(partProps) => (
					<div {...partProps} data-slot="context-menu-group">
						{children}
					</div>
				)}
			/>
		</InMenuGroupContext.Provider>
	);
}

type LabelProps = React.ComponentPropsWithRef<"div"> & { inset?: boolean };

export function ContextMenuLabel({ className, inset, children, ...props }: LabelProps) {
	const inGroup = React.useContext(InMenuGroupContext);
	const resolvedSlot = (props as Record<string, unknown>)["data-slot"] as string | undefined;
	const dataSlot = resolvedSlot ?? "context-menu-label";
	if (inGroup) {
		return (
			<SdkGroupLabel
				className={cn("cn-context-menu-label", className)}
				{...props}
				render={(partProps) => (
					<div {...partProps} data-slot={dataSlot} data-inset={inset || undefined}>
						{children}
					</div>
				)}
			/>
		);
	}
	return (
		<div
			{...props}
			data-slot={dataSlot}
			data-inset={inset || undefined}
			className={cn("cn-context-menu-label", className)}
		>
			{children}
		</div>
	);
}

export function ContextMenuGroupHeading(props: LabelProps) {
	return <ContextMenuLabel data-slot="context-menu-group-heading" {...props} />;
}

export type ContextMenuItemProps = Omit<React.ComponentPropsWithRef<"div">, "onSelect"> & {
	asChild?: boolean;
	inset?: boolean;
	variant?: "default" | "destructive";
	value?: string;
	label?: string;
	textValue?: string;
	disabled?: boolean;
	shortcut?: string;
	closeOnSelect?: boolean;
	onSelect?: (event: Event) => unknown;
};

export function ContextMenuItem({
	className,
	asChild,
	inset,
	variant = "default",
	value,
	label,
	textValue,
	disabled,
	shortcut,
	closeOnSelect = true,
	onSelect,
	children,
	...props
}: ContextMenuItemProps) {
	return (
		<SdkItem
			value={value}
			label={label ?? textValue}
			disabled={disabled}
			destructive={variant === "destructive"}
			shortcut={shortcut}
			closeOnSelect={closeOnSelect}
			onSelect={onSelect}
			className={cn(
				"cn-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
			render={(partProps) => {
				const finalProps = {
					...partProps,
					"data-slot": "context-menu-item",
					"data-inset": inset || undefined,
					"data-variant": variant,
				};
				if (asChild) {
					return <Slot.Root {...finalProps}>{children}</Slot.Root>;
				}
				return <div {...finalProps}>{children}</div>;
			}}
		/>
	);
}

type Checked = boolean | "indeterminate";
export type ContextMenuCheckboxItemProps = Omit<
	React.ComponentPropsWithRef<"div">,
	"onSelect" | "defaultChecked"
> & {
	asChild?: boolean;
	checked?: Checked;
	defaultChecked?: Checked;
	value?: string;
	label?: string;
	textValue?: string;
	disabled?: boolean;
	closeOnSelect?: boolean;
	inset?: boolean;
	onSelect?: (event: Event) => void;
	onCheckedChange?: (checked: boolean, details?: ChangeDetails<MenuCheckedChangeReason>) => void;
};

export function ContextMenuCheckboxItem({
	className,
	asChild,
	checked,
	defaultChecked = false,
	value,
	label,
	textValue,
	disabled,
	children,
	inset,
	closeOnSelect = false,
	onSelect,
	onCheckedChange,
	...props
}: ContextMenuCheckboxItemProps) {
	const generatedId = React.useId();
	const [internal, setInternal] = React.useState<Checked>(defaultChecked);
	const resolvedChecked: Checked = checked ?? internal;
	const isIndeterminate = resolvedChecked === "indeterminate";

	return (
		<SdkCheckboxItem
			value={value ?? generatedId}
			label={label ?? textValue}
			disabled={disabled}
			checked={isIndeterminate ? false : resolvedChecked}
			closeOnSelect={closeOnSelect}
			onCheckedChange={(next, details) => {
				if (onSelect) {
					onSelect(new Event("select", { cancelable: true }));
				}
				if (checked === undefined) setInternal(next);
				onCheckedChange?.(next, details);
			}}
			className={cn(
				"cn-context-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
			render={(partProps, state) => {
				const indicatorState = isIndeterminate
					? "indeterminate"
					: state.checked
						? "checked"
						: "unchecked";
				const finalProps = {
					...partProps,
					"data-slot": "context-menu-checkbox-item",
					"data-inset": inset || undefined,
					"data-state": indicatorState,
					...(isIndeterminate
						? {
								"aria-checked": "mixed" as const,
								"data-indeterminate": "",
								"data-checked": undefined,
								"data-unchecked": undefined,
							}
						: {}),
				};
				const indicator =
					isIndeterminate || state.checked ? (
						<span
							aria-hidden="true"
							data-slot="context-menu-item-indicator"
							data-state={indicatorState}
							className="cn-context-menu-item-indicator group/indicator pointer-events-none"
						>
							{isIndeterminate ? <MinusIcon /> : <CheckIcon />}
						</span>
					) : null;
				if (asChild) {
					return (
						<Slot.Root {...finalProps}>
							<Slot.Slottable>{children}</Slot.Slottable>
							{indicator}
						</Slot.Root>
					);
				}
				return (
					<div {...finalProps}>
						{children}
						{indicator}
					</div>
				);
			}}
		/>
	);
}

export type ContextMenuRadioGroupProps = Omit<React.ComponentPropsWithRef<"div">, "defaultValue"> & {
	name?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string, details?: ChangeDetails<MenuValueChangeReason>) => void;
};

export function ContextMenuRadioGroup({
	name,
	value,
	defaultValue = "",
	onValueChange,
	children,
	...props
}: ContextMenuRadioGroupProps) {
	const generatedName = React.useId();
	const [internal, setInternal] = React.useState(defaultValue);
	return (
		<InMenuGroupContext.Provider value={true}>
			<SdkRadioGroup
				name={name ?? generatedName}
				value={value ?? internal}
				onValueChange={(next, details) => {
					if (value === undefined) setInternal(next);
					onValueChange?.(next, details);
				}}
				{...props}
				render={(partProps) => (
					<div {...partProps} data-slot="context-menu-radio-group">
						{children}
					</div>
				)}
			/>
		</InMenuGroupContext.Provider>
	);
}

export type ContextMenuRadioItemProps = Omit<React.ComponentPropsWithRef<"div">, "onSelect"> & {
	asChild?: boolean;
	value: string;
	label?: string;
	textValue?: string;
	disabled?: boolean;
	closeOnSelect?: boolean;
	inset?: boolean;
	onSelect?: (event: Event) => void;
};

export function ContextMenuRadioItem({
	className,
	asChild,
	value,
	label,
	textValue,
	disabled,
	children,
	inset,
	closeOnSelect = false,
	onSelect,
	onClick,
	...props
}: ContextMenuRadioItemProps) {
	return (
		<SdkRadioItem
			value={value}
			label={label ?? textValue}
			disabled={disabled}
			closeOnSelect={closeOnSelect}
			className={cn(
				"cn-context-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			onClick={(event) => {
				onClick?.(event);
				if (onSelect && !disabled) {
					onSelect(new Event("select", { cancelable: true }));
				}
			}}
			{...props}
			render={(partProps, state) => {
				const finalProps = {
					...partProps,
					"data-slot": "context-menu-radio-item",
					"data-inset": inset || undefined,
					"data-state": state.checked ? "checked" : "unchecked",
				};
				const indicator = state.checked ? (
					<span
						aria-hidden="true"
						data-slot="context-menu-item-indicator"
						data-state="checked"
						className="cn-context-menu-item-indicator pointer-events-none"
					>
						<CheckIcon />
					</span>
				) : null;
				if (asChild) {
					return (
						<Slot.Root {...finalProps}>
							<Slot.Slottable>{children}</Slot.Slottable>
							{indicator}
						</Slot.Root>
					);
				}
				return (
					<div {...finalProps}>
						{children}
						{indicator}
					</div>
				);
			}}
		/>
	);
}

export function ContextMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="context-menu-separator"
			className={cn("cn-context-menu-separator", className)}
			{...props}
		/>
	);
}

export function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
	return (
		<Kbd
			appearance="inline"
			data-slot="context-menu-shortcut"
			className={cn("cn-context-menu-shortcut", className)}
			{...props}
		/>
	);
}

const SubPolicyContext = React.createContext<React.MutableRefObject<MenuDismissPolicy> | null>(null);

export interface ContextMenuSubProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<MenuOpenChangeReason>) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	loop?: boolean;
	delay?: number;
	controller?: MenuController<unknown>;
	children?: React.ReactNode;
}

export function ContextMenuSub({
	open,
	defaultOpen,
	onOpenChange,
	onOpenChangeComplete,
	loop,
	delay,
	controller,
	children,
}: ContextMenuSubProps) {
	const policyRef = React.useRef<MenuDismissPolicy>({});

	function handleOpenChange(next: boolean, details: ChangeDetails<MenuOpenChangeReason>) {
		if (!next && details.reason === "escape-key" && policyRef.current.onEscapeKeyDown) {
			const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
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
		<SubPolicyContext.Provider value={policyRef}>
			<SdkSub
				open={open}
				defaultOpen={defaultOpen}
				loop={loop}
				delay={delay}
				controller={controller}
				onOpenChange={handleOpenChange}
				onOpenChangeComplete={onOpenChangeComplete}
			>
				{children}
			</SdkSub>
		</SubPolicyContext.Provider>
	);
}

export type ContextMenuSubTriggerProps = React.ComponentPropsWithRef<"div"> & {
	asChild?: boolean;
	inset?: boolean;
	disabled?: boolean;
};

export function ContextMenuSubTrigger({
	className,
	asChild,
	children,
	inset,
	disabled,
	...props
}: ContextMenuSubTriggerProps) {
	return (
		<SdkSubTrigger
			disabled={disabled}
			className={cn(
				"cn-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
			render={(partProps, state) => {
				const finalProps = {
					...partProps,
					"data-slot": "context-menu-sub-trigger",
					"data-inset": inset || undefined,
					"data-state": state.open ? "open" : "closed",
				};
				if (asChild) {
					return (
						<Slot.Root {...finalProps}>
							<Slot.Slottable>{children}</Slot.Slottable>
							<ChevronRightIcon aria-hidden="true" className="ms-auto rtl:rotate-180" />
						</Slot.Root>
					);
				}
				return (
					<div {...finalProps}>
						{children}
						<ChevronRightIcon aria-hidden="true" className="ms-auto rtl:rotate-180" />
					</div>
				);
			}}
		/>
	);
}

export type ContextMenuSubContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> &
	PortalProps & {
		elevated?: boolean;
		side?: Side;
		align?: "start" | "center" | "end";
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
		arrowPadding?: number;
		anchor?: Anchor | string | null;
		keepMounted?: boolean;
		forceMount?: boolean;
		container?: Element | DocumentFragment | null;
		onEscapeKeyDown?: (event: KeyboardEvent) => void;
		asChild?: boolean;
		children?: React.ReactNode;
	};

export function ContextMenuSubContent({
	className,
	style,
	elevated = false,
	side,
	align = "start",
	sideOffset,
	alignOffset = -3,
	collisionPadding = 8,
	arrowPadding,
	anchor,
	portalProps,
	container: containerProp,
	forceMount,
	keepMounted,
	onEscapeKeyDown,
	asChild,
	children,
	...props
}: ContextMenuSubContentProps) {
	const policyRef = React.useContext(SubPolicyContext);
	React.useEffect(() => {
		if (!policyRef) return;
		policyRef.current = { onEscapeKeyDown };
		return () => {
			policyRef.current = {};
		};
	}, [policyRef, onEscapeKeyDown]);

	const resolvedContainer =
		portalProps === false
			? undefined
			: (containerProp ?? (typeof portalProps === "object" ? portalProps.container : undefined));
	const resolvedKeepMounted =
		keepMounted ?? forceMount ?? (typeof portalProps === "object" ? portalProps.forceMount : undefined);

	return (
		<SdkSubContent
			side={side}
			align={align}
			sideOffset={sideOffset}
			alignOffset={alignOffset}
			collisionPadding={collisionPadding}
			arrowPadding={arrowPadding}
			anchor={anchor}
			keepMounted={resolvedKeepMounted}
			container={resolvedContainer}
			className={cn(
				"cn-context-menu-sub-content cn-overlay-surface cn-context-menu-surface z-50 max-h-(--available-height) max-w-[min(var(--available-width,100dvw),calc(100dvw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden [--bits-floating-available-width:var(--available-width)]",
				elevated && "cn-context-menu-sub-elevated",
				className
			)}
			style={{
				"--radix-context-menu-content-available-height": "var(--available-height)",
				"--radix-context-menu-content-available-width": "var(--available-width)",
				"--radix-context-menu-content-transform-origin": "var(--transform-origin)",
				...style,
			} as React.CSSProperties}
			{...props}
			onKeyDown={(event) => {
				props.onKeyDown?.(event);
				skipDisabledMenuItems(event.currentTarget, event.key);
			}}
			render={(partProps, state) => {
				const resolvedSide = (partProps as Record<string, unknown>)["data-side"] ?? side ?? "right";
				const resolvedAlign = (partProps as Record<string, unknown>)["data-align"] ?? align;
				const finalProps = {
					...partProps,
					...(Boolean(props["aria-label"]) && !props["aria-labelledby"]
						? { "aria-labelledby": undefined }
						: {}),
					"data-slot": "context-menu-sub-content",
					"data-elevated": elevated || undefined,
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
