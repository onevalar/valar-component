"use client";

import * as React from "react";
import {
	Menu as SdkMenu,
	MenuCheckboxItem as SdkCheckboxItem,
	MenuContent as SdkContent,
	MenuGroup as SdkGroup,
	MenuGroupLabel as SdkGroupLabel,
	MenuItem as SdkItem,
	MenuRadioGroup as SdkRadioGroup,
	MenuRadioItem as SdkRadioItem,
	MenuSub as SdkSub,
	MenuSubContent as SdkSubContent,
	MenuSubTrigger as SdkSubTrigger,
	MenuTrigger as SdkTrigger,
	type MenuCheckedChangeReason,
	type MenuController,
	type MenuFinalFocus,
	type MenuOpenChangeReason,
	type MenuValueChangeReason,
} from "@ui-sdk/react/menu";
import {
	Menubar as SdkMenubar,
	type MenubarController,
	type MenubarOrientation,
} from "@ui-sdk/react/menubar";
import type { Anchor, ChangeDetails, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { Kbd } from "./kbd.tsx";
import { Separator } from "./separator.tsx";

type MenuDismissPolicy = {
	onInteractOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

type MenubarContextValue = {
	value: string | undefined;
	isControlled: boolean;
	onMenuOpenChange: (menuValue: string, open: boolean) => void;
};

const MenubarValueContext = React.createContext<MenubarContextValue | null>(null);
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

export interface MenubarProps extends Omit<React.ComponentPropsWithRef<"div">, "defaultValue"> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	orientation?: MenubarOrientation;
	loop?: boolean;
	disabled?: boolean;
	modal?: boolean | "pointer";
	dir?: "ltr" | "rtl";
	controller?: MenubarController;
}

export function Menubar({
	className,
	value,
	defaultValue,
	onValueChange,
	orientation,
	loop,
	disabled,
	modal,
	controller,
	children,
	...props
}: MenubarProps) {
	const [internal, setInternal] = React.useState(defaultValue ?? "");
	const isControlled = value !== undefined;
	const currentRef = React.useRef(isControlled ? value : internal);
	currentRef.current = isControlled ? value : internal;

	const ctxValue = React.useMemo<MenubarContextValue>(
		() => ({
			value: isControlled ? value : internal,
			isControlled,
			onMenuOpenChange(menuValue, nextOpen) {
				if (nextOpen) {
					if (!isControlled) setInternal(menuValue);
					if (currentRef.current !== menuValue) onValueChange?.(menuValue);
				} else if (currentRef.current === menuValue) {
					if (!isControlled) setInternal("");
					onValueChange?.("");
				}
			},
		}),
		[isControlled, value, internal, onValueChange]
	);

	return (
		<MenubarValueContext.Provider value={ctxValue}>
			<SdkMenubar
				orientation={orientation}
				loop={loop}
				disabled={disabled}
				modal={modal}
				controller={controller}
				className={cn("cn-menubar flex items-center", className)}
				{...props}
				render={(partProps) => (
					<div {...partProps} data-slot="menubar">
						{children}
					</div>
				)}
			/>
		</MenubarValueContext.Provider>
	);
}

export interface MenubarMenuProps {
	value?: string;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<MenuOpenChangeReason>) => void;
	modal?: boolean | "pointer";
	loop?: boolean;
	delay?: number;
	controller?: MenuController<unknown>;
	container?: Element | DocumentFragment | null;
	children?: React.ReactNode;
}

export function MenubarMenu({
	value,
	open,
	defaultOpen,
	onOpenChange,
	modal,
	loop,
	delay,
	controller,
	container,
	children,
}: MenubarMenuProps) {
	const generatedValue = React.useId();
	const menuValue = value ?? generatedValue;
	const bar = React.useContext(MenubarValueContext);
	const policyRef = React.useRef<MenuDismissPolicy>({});
	const controlledOpen =
		open !== undefined
			? open
			: bar?.isControlled
				? bar.value === menuValue
				: undefined;

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
		if (!details.canceled) {
			bar?.onMenuOpenChange(menuValue, next);
			if (!next && details.reason === "escape-key") {
				details.event?.stopPropagation();
			}
		}
	}

	return (
		<MenuPolicyContext.Provider value={policyRef}>
			<SdkMenu
				open={controlledOpen}
				defaultOpen={defaultOpen ?? (bar && !bar.isControlled && bar.value === menuValue ? true : undefined)}
				modal={modal}
				loop={loop}
				delay={delay}
				presentation="popover"
				controller={controller}
				container={container}
				onOpenChange={handleOpenChange}
			>
				{children}
			</SdkMenu>
		</MenuPolicyContext.Provider>
	);
}

export interface MenubarPortalProps {
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	children?: React.ReactNode;
}

export function MenubarPortal({ children }: MenubarPortalProps) {
	return <>{children}</>;
}

type PortalProps = {
	portalProps?: false | Omit<MenubarPortalProps, "children">;
};

export type MenubarTriggerProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
	disabled?: boolean;
	focusableWhenDisabled?: boolean;
	shortcut?: string;
};

export function MenubarTrigger({
	className,
	asChild,
	disabled,
	focusableWhenDisabled,
	shortcut,
	children,
	...props
}: MenubarTriggerProps) {
	return (
		<SdkTrigger
			disabled={disabled}
			focusableWhenDisabled={focusableWhenDisabled}
			shortcut={shortcut}
			className={cn(
				"cn-menubar-trigger flex items-center outline-hidden select-none disabled:opacity-50",
				className
			)}
			{...props}
			render={(partProps, state) => {
				const finalProps = {
					...partProps,
					"data-slot": "menubar-trigger",
					"data-state": state.open ? "open" : "closed",
				};
				if (asChild) {
					return <Slot.Root {...finalProps}>{children}</Slot.Root>;
				}
				return <button {...finalProps}>{children}</button>;
			}}
		/>
	);
}

export type MenubarContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> &
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

export function MenubarContent({
	className,
	style,
	side = "bottom",
	sideOffset = 8,
	align = "start",
	alignOffset = -4,
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
}: MenubarContentProps) {
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
			sideOffset={sideOffset}
			align={align}
			alignOffset={alignOffset}
			collisionPadding={collisionPadding}
			arrowPadding={arrowPadding}
			anchor={anchor}
			finalFocus={resolvedFinalFocus}
			keepMounted={resolvedKeepMounted}
			container={resolvedContainer}
			className={cn(
				"cn-menubar-content z-50 max-h-(--available-height) max-w-[min(var(--available-width,100dvw),calc(100dvw-1rem))] min-w-[min(9rem,var(--available-width,100dvw),calc(100dvw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden",
				className
			)}
			style={{
				"--radix-menubar-content-available-height": "var(--available-height)",
				"--radix-menubar-content-available-width": "var(--available-width)",
				"--radix-menubar-content-transform-origin": "var(--transform-origin)",
				...style,
			} as React.CSSProperties}
			{...props}
			onKeyDown={(event) => {
				props.onKeyDown?.(event);
				skipDisabledMenuItems(event.currentTarget, event.key);
			}}
			render={(partProps, state) => {
				const resolvedSide = (partProps as Record<string, unknown>)["data-side"] ?? side;
				const resolvedAlign = (partProps as Record<string, unknown>)["data-align"] ?? align;
				const finalProps = {
					...partProps,
					...(hasExplicitAriaLabel ? { "aria-labelledby": undefined } : {}),
					"data-slot": "menubar-content",
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

export function MenubarGroup({ children, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<InMenuGroupContext.Provider value={true}>
			<SdkGroup
				{...props}
				render={(partProps) => (
					<div {...partProps} data-slot="menubar-group">
						{children}
					</div>
				)}
			/>
		</InMenuGroupContext.Provider>
	);
}

type LabelProps = React.ComponentPropsWithRef<"div"> & { inset?: boolean };

export function MenubarLabel({ className, inset, children, ...props }: LabelProps) {
	const inGroup = React.useContext(InMenuGroupContext);
	const resolvedSlot = (props as Record<string, unknown>)["data-slot"] as string | undefined;
	const dataSlot = resolvedSlot ?? "menubar-label";
	if (inGroup) {
		return (
			<SdkGroupLabel
				className={cn("cn-menubar-label data-inset:ps-7 data-inset:pe-1.5", className)}
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
			className={cn("cn-menubar-label data-inset:ps-7 data-inset:pe-1.5", className)}
		>
			{children}
		</div>
	);
}

export function MenubarGroupHeading(props: LabelProps) {
	return <MenubarLabel data-slot="menubar-group-heading" {...props} />;
}

export type MenubarItemProps = Omit<React.ComponentPropsWithRef<"div">, "onSelect"> & {
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

export function MenubarItem({
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
}: MenubarItemProps) {
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
				"cn-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-inset:ps-7 data-inset:pe-1.5 data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
			render={(partProps) => {
				const finalProps = {
					...partProps,
					"data-slot": "menubar-item",
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
export type MenubarCheckboxItemProps = Omit<
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

export function MenubarCheckboxItem({
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
}: MenubarCheckboxItemProps) {
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
				"cn-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
					"data-slot": "menubar-checkbox-item",
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
							data-slot="menubar-checkbox-item-indicator"
							data-state={indicatorState}
							className="cn-menubar-checkbox-item-indicator group/indicator pointer-events-none absolute flex items-center justify-center"
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

export type MenubarRadioGroupProps = Omit<React.ComponentPropsWithRef<"div">, "defaultValue"> & {
	name?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string, details?: ChangeDetails<MenuValueChangeReason>) => void;
};

export function MenubarRadioGroup({
	name,
	value,
	defaultValue = "",
	onValueChange,
	children,
	...props
}: MenubarRadioGroupProps) {
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
					<div {...partProps} data-slot="menubar-radio-group">
						{children}
					</div>
				)}
			/>
		</InMenuGroupContext.Provider>
	);
}

export type MenubarRadioItemProps = Omit<React.ComponentPropsWithRef<"div">, "onSelect"> & {
	asChild?: boolean;
	value: string;
	label?: string;
	textValue?: string;
	disabled?: boolean;
	closeOnSelect?: boolean;
	inset?: boolean;
	onSelect?: (event: Event) => void;
};

export function MenubarRadioItem({
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
}: MenubarRadioItemProps) {
	return (
		<SdkRadioItem
			value={value}
			label={label ?? textValue}
			disabled={disabled}
			closeOnSelect={closeOnSelect}
			className={cn(
				"cn-menubar-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
					"data-slot": "menubar-radio-item",
					"data-inset": inset || undefined,
					"data-state": state.checked ? "checked" : "unchecked",
				};
				const indicator = state.checked ? (
					<span
						aria-hidden="true"
						data-slot="menubar-radio-item-indicator"
						data-state="checked"
						className="cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center"
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

export function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="menubar-separator"
			className={cn("cn-menubar-separator -mx-1 my-1", className)}
			{...props}
		/>
	);
}

export function MenubarShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
	return (
		<Kbd
			appearance="inline"
			data-slot="menubar-shortcut"
			className={cn("cn-menubar-shortcut ms-auto", className)}
			{...props}
		/>
	);
}

const SubPolicyContext = React.createContext<React.MutableRefObject<MenuDismissPolicy> | null>(null);

export interface MenubarSubProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<MenuOpenChangeReason>) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	loop?: boolean;
	delay?: number;
	controller?: MenuController<unknown>;
	children?: React.ReactNode;
}

export function MenubarSub({
	open,
	defaultOpen,
	onOpenChange,
	onOpenChangeComplete,
	loop,
	delay,
	controller,
	children,
}: MenubarSubProps) {
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

export type MenubarSubTriggerProps = React.ComponentPropsWithRef<"div"> & {
	asChild?: boolean;
	inset?: boolean;
	disabled?: boolean;
};

export function MenubarSubTrigger({
	className,
	asChild,
	children,
	inset,
	disabled,
	...props
}: MenubarSubTriggerProps) {
	return (
		<SdkSubTrigger
			disabled={disabled}
			className={cn(
				"cn-menubar-sub-trigger flex cursor-default items-center outline-none select-none data-inset:ps-7 data-inset:pe-1.5 data-disabled:pointer-events-none data-disabled:opacity-50",
				className
			)}
			{...props}
			render={(partProps, state) => {
				const finalProps = {
					...partProps,
					"data-slot": "menubar-sub-trigger",
					"data-inset": inset || undefined,
					"data-state": state.open ? "open" : "closed",
				};
				if (asChild) {
					return (
						<Slot.Root {...finalProps}>
							<Slot.Slottable>{children}</Slot.Slottable>
							<ChevronRightIcon aria-hidden="true" className="ms-auto size-4 rtl:rotate-180" />
						</Slot.Root>
					);
				}
				return (
					<div {...finalProps}>
						{children}
						<ChevronRightIcon aria-hidden="true" className="ms-auto size-4 rtl:rotate-180" />
					</div>
				);
			}}
		/>
	);
}

export type MenubarSubContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> &
	PortalProps & {
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

export function MenubarSubContent({
	className,
	style,
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
}: MenubarSubContentProps) {
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
				"cn-menubar-sub-content z-50 max-h-(--available-height) max-w-[min(var(--available-width,100dvw),calc(100dvw-1rem))] min-w-[min(8rem,var(--available-width,100dvw),calc(100dvw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden",
				className
			)}
			style={{
				"--radix-menubar-content-available-height": "var(--available-height)",
				"--radix-menubar-content-available-width": "var(--available-width)",
				"--radix-menubar-content-transform-origin": "var(--transform-origin)",
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
					"data-slot": "menubar-sub-content",
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
