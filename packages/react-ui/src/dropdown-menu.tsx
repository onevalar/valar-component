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

export interface DropdownMenuProps {
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
	presentation?: "auto" | "popover" | "sheet";
	dismissible?: boolean;
	controller?: MenuController<unknown>;
	container?: Element | DocumentFragment | null;
	dir?: "ltr" | "rtl";
	children?: React.ReactNode;
}

export function DropdownMenu({
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
	presentation = "popover",
	dismissible,
	controller,
	container,
	children,
}: DropdownMenuProps) {
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
				presentation={presentation}
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

export interface DropdownMenuPortalProps {
	container?: Element | DocumentFragment | null;
	forceMount?: boolean;
	children?: React.ReactNode;
}

export function DropdownMenuPortal({ children }: DropdownMenuPortalProps) {
	return <>{children}</>;
}

type OverlayProps = {
	appearance?: "default" | "surface";
	portalProps?: false | Omit<DropdownMenuPortalProps, "children">;
};

export type DropdownMenuTriggerProps = React.ComponentPropsWithRef<"button"> & {
	asChild?: boolean;
	focusableWhenDisabled?: boolean;
	payload?: unknown;
	shortcut?: string;
	controller?: MenuController<unknown>;
};

export function DropdownMenuTrigger({
	asChild,
	disabled,
	focusableWhenDisabled,
	payload,
	shortcut,
	controller,
	children,
	...props
}: DropdownMenuTriggerProps) {
	return (
		<SdkTrigger
			disabled={disabled}
			focusableWhenDisabled={focusableWhenDisabled}
			payload={payload}
			shortcut={shortcut}
			controller={controller}
			{...props}
			render={(partProps, state) => {
				const finalProps = {
					...partProps,
					"data-slot": "dropdown-menu-trigger",
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

export type DropdownMenuContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> &
	OverlayProps & {
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

export function DropdownMenuContent({
	className,
	style,
	appearance = "default",
	side = "bottom",
	align = "start",
	sideOffset = 4,
	alignOffset = 0,
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
	onKeyDown,
	asChild,
	children,
	...props
}: DropdownMenuContentProps) {
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
				"cn-dropdown-menu-content cn-overlay-surface cn-dropdown-menu-surface z-50 max-h-(--available-height) max-w-[min(var(--available-width,100dvw),calc(100dvw-1rem))] min-w-[min(8rem,var(--available-width,100dvw),calc(100dvw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden data-closed:overflow-hidden",
				appearance === "default" ? "w-(--anchor-width)" : "animate-none!",
				className
			)}
			style={{
				"--radix-dropdown-menu-content-available-height": "var(--available-height)",
				"--radix-dropdown-menu-content-available-width": "var(--available-width)",
				"--radix-dropdown-menu-content-transform-origin": "var(--transform-origin)",
				"--radix-dropdown-menu-trigger-width": "var(--anchor-width)",
				...style,
			} as React.CSSProperties}
			onKeyDown={(event) => {
				onKeyDown?.(event);
				skipDisabledMenuItems(event.currentTarget, event.key);
			}}
			{...props}
			render={(partProps, state) => {
				const resolvedSide = (partProps as Record<string, unknown>)["data-side"] ?? side;
				const resolvedAlign = (partProps as Record<string, unknown>)["data-align"] ?? align;
				const finalProps = {
					...partProps,
					...(hasExplicitAriaLabel ? { "aria-labelledby": undefined } : {}),
					"data-slot": "dropdown-menu-content",
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

export function DropdownMenuGroup({
	children,
	...props
}: React.ComponentPropsWithRef<"div">) {
	return (
		<InMenuGroupContext.Provider value={true}>
			<SdkGroup
				{...props}
				render={(partProps) => (
					<div {...partProps} data-slot="dropdown-menu-group">
						{children}
					</div>
				)}
			/>
		</InMenuGroupContext.Provider>
	);
}

type LabelProps = React.ComponentPropsWithRef<"div"> & { inset?: boolean };

export function DropdownMenuLabel({ className, inset, children, ...props }: LabelProps) {
	const inGroup = React.useContext(InMenuGroupContext);
	const resolvedSlot = (props as Record<string, unknown>)["data-slot"] as string | undefined;
	const dataSlot = resolvedSlot ?? "dropdown-menu-label";
	if (inGroup) {
		return (
			<SdkGroupLabel
				className={cn("cn-dropdown-menu-label", className)}
				{...props}
				render={(partProps) => (
					<div
						{...partProps}
						data-slot={dataSlot}
						data-inset={inset || undefined}
					>
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
			className={cn("cn-dropdown-menu-label", className)}
		>
			{children}
		</div>
	);
}

export function DropdownMenuGroupHeading(props: LabelProps) {
	return <DropdownMenuLabel data-slot="dropdown-menu-group-heading" {...props} />;
}

export type DropdownMenuItemProps = Omit<React.ComponentPropsWithRef<"div">, "onSelect"> & {
	asChild?: boolean;
	inset?: boolean;
	variant?: "default" | "destructive";
	value?: string;
	label?: string;
	disabled?: boolean;
	shortcut?: string;
	closeOnSelect?: boolean;
	textValue?: string;
	onSelect?: (event: Event) => unknown;
};

export function DropdownMenuItem({
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
}: DropdownMenuItemProps) {
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
				"cn-dropdown-menu-item group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
			render={(partProps) => {
				const finalProps = {
					...partProps,
					"data-slot": "dropdown-menu-item",
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

const CheckboxGroup = React.createContext<{
	value: string[];
	setChecked: (item: string, checked: boolean) => void;
} | null>(null);

export type DropdownMenuCheckboxGroupProps = Omit<
	React.ComponentPropsWithRef<"div">,
	"defaultValue"
> & {
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (value: string[]) => void;
};

export function DropdownMenuCheckboxGroup({
	value,
	defaultValue = [],
	onValueChange,
	children,
	...props
}: DropdownMenuCheckboxGroupProps) {
	const [internal, setInternal] = React.useState(defaultValue);
	const current = value ?? internal;
	return (
		<CheckboxGroup.Provider
			value={{
				value: current,
				setChecked(item, checked) {
					if (current.includes(item) === checked) return;
					const next = checked ? [...current, item] : current.filter((entry) => entry !== item);
					if (value === undefined) setInternal(next);
					onValueChange?.(next);
				},
			}}
		>
			<InMenuGroupContext.Provider value={true}>
				<SdkGroup
					{...props}
					render={(partProps) => (
						<div {...partProps} data-slot="dropdown-menu-checkbox-group">
							{children}
						</div>
					)}
				/>
			</InMenuGroupContext.Provider>
		</CheckboxGroup.Provider>
	);
}

type Checked = boolean | "indeterminate";
export type DropdownMenuCheckboxItemProps = Omit<
	React.ComponentPropsWithRef<"div">,
	"onSelect" | "defaultChecked"
> & {
	asChild?: boolean;
	checked?: Checked;
	defaultChecked?: Checked;
	/** Identifies the option within a DropdownMenuCheckboxGroup. */
	value?: string;
	label?: string;
	textValue?: string;
	disabled?: boolean;
	closeOnSelect?: boolean;
	inset?: boolean;
	onSelect?: (event: Event) => void;
	onCheckedChange?: (checked: boolean, details?: ChangeDetails<MenuCheckedChangeReason>) => void;
};

export function DropdownMenuCheckboxItem({
	className,
	asChild,
	checked,
	defaultChecked = false,
	value,
	label,
	textValue,
	disabled,
	inset,
	closeOnSelect = false,
	onSelect,
	onCheckedChange,
	children,
	...props
}: DropdownMenuCheckboxItemProps) {
	const generatedId = React.useId();
	const group = React.useContext(CheckboxGroup);
	const [internal, setInternal] = React.useState<Checked>(defaultChecked);
	const grouped = group !== null && value !== undefined;
	const resolvedChecked: Checked = checked ?? (grouped ? group.value.includes(value) : internal);
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
					const event = new Event("select", { cancelable: true });
					onSelect(event);
				}
				if (grouped) group.setChecked(value, next);
				else if (checked === undefined) setInternal(next);
				onCheckedChange?.(next, details);
			}}
			className={cn(
				"cn-dropdown-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
					"data-slot": "dropdown-menu-checkbox-item",
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
							data-slot="dropdown-menu-checkbox-item-indicator"
							data-state={indicatorState}
							className="cn-dropdown-menu-item-indicator group/indicator pointer-events-none"
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

export type DropdownMenuRadioGroupProps = Omit<
	React.ComponentPropsWithRef<"div">,
	"defaultValue"
> & {
	name?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string, details?: ChangeDetails<MenuValueChangeReason>) => void;
};

export function DropdownMenuRadioGroup({
	name,
	value,
	defaultValue = "",
	onValueChange,
	children,
	...props
}: DropdownMenuRadioGroupProps) {
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
					<div {...partProps} data-slot="dropdown-menu-radio-group">
						{children}
					</div>
				)}
			/>
		</InMenuGroupContext.Provider>
	);
}

export type DropdownMenuRadioItemProps = Omit<React.ComponentPropsWithRef<"div">, "onSelect"> & {
	asChild?: boolean;
	value: string;
	label?: string;
	textValue?: string;
	disabled?: boolean;
	closeOnSelect?: boolean;
	inset?: boolean;
	onSelect?: (event: Event) => void;
};

export function DropdownMenuRadioItem({
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
}: DropdownMenuRadioItemProps) {
	return (
		<SdkRadioItem
			value={value}
			label={label ?? textValue}
			disabled={disabled}
			closeOnSelect={closeOnSelect}
			className={cn(
				"cn-dropdown-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
					"data-slot": "dropdown-menu-radio-item",
					"data-inset": inset || undefined,
					"data-state": state.checked ? "checked" : "unchecked",
				};
				const indicator = state.checked ? (
					<span
						aria-hidden="true"
						data-slot="dropdown-menu-radio-item-indicator"
						data-state="checked"
						className="cn-dropdown-menu-item-indicator pointer-events-none"
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

export function DropdownMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="dropdown-menu-separator"
			className={cn("cn-dropdown-menu-separator", className)}
			{...props}
		/>
	);
}

export function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
	return (
		<Kbd
			appearance="inline"
			data-slot="dropdown-menu-shortcut"
			className={cn("cn-dropdown-menu-shortcut", className)}
			{...props}
		/>
	);
}

const SubPolicyContext = React.createContext<React.MutableRefObject<MenuDismissPolicy> | null>(null);

export interface DropdownMenuSubProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<MenuOpenChangeReason>) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	loop?: boolean;
	delay?: number;
	controller?: MenuController<unknown>;
	children?: React.ReactNode;
}

export function DropdownMenuSub({
	open,
	defaultOpen,
	onOpenChange,
	onOpenChangeComplete,
	loop,
	delay,
	controller,
	children,
}: DropdownMenuSubProps) {
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

export type DropdownMenuSubTriggerProps = React.ComponentPropsWithRef<"div"> & {
	asChild?: boolean;
	inset?: boolean;
	disabled?: boolean;
};

export function DropdownMenuSubTrigger({
	className,
	asChild,
	children,
	inset,
	disabled,
	...props
}: DropdownMenuSubTriggerProps) {
	return (
		<SdkSubTrigger
			disabled={disabled}
			className={cn(
				"cn-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
			render={(partProps, state) => {
				const finalProps = {
					...partProps,
					"data-slot": "dropdown-menu-sub-trigger",
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

export type DropdownMenuSubContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> &
	OverlayProps & {
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

export function DropdownMenuSubContent({
	className,
	style,
	appearance = "default",
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
}: DropdownMenuSubContentProps) {
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

	const hasExplicitAriaLabel = Boolean(props["aria-label"]) && !props["aria-labelledby"];

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
				"cn-dropdown-menu-sub-content cn-overlay-surface cn-dropdown-menu-surface z-50 max-h-(--available-height) max-w-[min(var(--available-width,100dvw),calc(100dvw-1rem))] min-w-[min(96px,var(--available-width,100dvw),calc(100dvw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden data-closed:overflow-hidden",
				appearance === "surface" && "animate-none!",
				className
			)}
			style={{
				"--radix-dropdown-menu-content-available-height": "var(--available-height)",
				"--radix-dropdown-menu-content-available-width": "var(--available-width)",
				"--radix-dropdown-menu-content-transform-origin": "var(--transform-origin)",
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
					...(hasExplicitAriaLabel ? { "aria-labelledby": undefined } : {}),
					"data-slot": "dropdown-menu-sub-content",
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
