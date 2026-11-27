"use client";

import * as React from "react";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";
import { DropdownMenu as Primitive, Slot } from "radix-ui";
import { Kbd } from "./kbd.tsx";
import { Separator } from "./separator.tsx";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuPortal = Primitive.Portal;

type OverlayProps = {
	appearance?: "default" | "surface";
	portalProps?: false | Omit<React.ComponentProps<typeof DropdownMenuPortal>, "children">;
};

export type DropdownMenuContentProps = React.ComponentProps<typeof Primitive.Content> &
	OverlayProps;

export function DropdownMenuTrigger(props: React.ComponentProps<typeof Primitive.Trigger>) {
	return <Primitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export function DropdownMenuContent({
	className,
	appearance = "default",
	align = "start",
	sideOffset = 4,
	collisionPadding = 8,
	portalProps,
	forceMount,
	...props
}: DropdownMenuContentProps) {
	const content = (
		<Primitive.Content
			data-slot="dropdown-menu-content"
			data-appearance={appearance}
			className={cn(
				"cn-dropdown-menu-content cn-overlay-surface cn-dropdown-menu-surface z-50 max-h-(--radix-dropdown-menu-content-available-height) max-w-[min(var(--radix-dropdown-menu-content-available-width,100dvw),calc(100dvw-1rem))] min-w-[min(8rem,var(--radix-dropdown-menu-content-available-width,100dvw),calc(100dvw-1rem))] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden data-closed:overflow-hidden",
				appearance === "default" ? "w-(--radix-dropdown-menu-trigger-width)" : "animate-none!",
				className
			)}
			align={align}
			sideOffset={sideOffset}
			collisionPadding={collisionPadding}
			forceMount={forceMount}
			{...props}
		/>
	);
	return portalProps === false ? (
		content
	) : (
		<DropdownMenuPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</DropdownMenuPortal>
	);
}

export function DropdownMenuGroup(props: React.ComponentProps<typeof Primitive.Group>) {
	return <Primitive.Group data-slot="dropdown-menu-group" {...props} />;
}

type LabelProps = React.ComponentProps<typeof Primitive.Label> & { inset?: boolean };

export function DropdownMenuLabel({ className, inset, ...props }: LabelProps) {
	return (
		<Primitive.Label
			data-slot="dropdown-menu-label"
			data-inset={inset || undefined}
			className={cn("cn-dropdown-menu-label", className)}
			{...props}
		/>
	);
}

export function DropdownMenuGroupHeading(props: LabelProps) {
	return <DropdownMenuLabel data-slot="dropdown-menu-group-heading" {...props} />;
}

export type DropdownMenuItemProps = React.ComponentProps<typeof Primitive.Item> & {
	inset?: boolean;
	variant?: "default" | "destructive";
	closeOnSelect?: boolean;
};

export function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	closeOnSelect = true,
	onSelect,
	...props
}: DropdownMenuItemProps) {
	return (
		<Primitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset || undefined}
			data-variant={variant}
			className={cn(
				"cn-dropdown-menu-item group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			onSelect={(event) => {
				onSelect?.(event);
				if (!closeOnSelect) event.preventDefault();
			}}
			{...props}
		/>
	);
}

const CheckboxGroup = React.createContext<{
	value: string[];
	setChecked: (item: string, checked: boolean) => void;
} | null>(null);

export type DropdownMenuCheckboxGroupProps = Omit<
	React.ComponentProps<typeof Primitive.Group>,
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
			<Primitive.Group data-slot="dropdown-menu-checkbox-group" {...props} />
		</CheckboxGroup.Provider>
	);
}

type Checked = NonNullable<React.ComponentProps<typeof Primitive.CheckboxItem>["checked"]>;
export type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof Primitive.CheckboxItem> & {
	defaultChecked?: Checked;
	/** Identifies the option within a DropdownMenuCheckboxGroup. */
	value?: string;
	closeOnSelect?: boolean;
	inset?: boolean;
};

export function DropdownMenuCheckboxItem({
	className,
	checked,
	defaultChecked = false,
	value,
	inset,
	closeOnSelect = false,
	onSelect,
	onCheckedChange,
	children,
	...props
}: DropdownMenuCheckboxItemProps) {
	const group = React.useContext(CheckboxGroup);
	const [internal, setInternal] = React.useState(defaultChecked);
	const grouped = group !== null && value !== undefined;
	return (
		<Primitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			data-inset={inset || undefined}
			className={cn(
				"cn-dropdown-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			checked={checked ?? (grouped ? group.value.includes(value) : internal)}
			onCheckedChange={(next) => {
				if (grouped) group.setChecked(value, next);
				else if (checked === undefined) setInternal(next);
				onCheckedChange?.(next);
			}}
			onSelect={(event) => {
				onSelect?.(event);
				if (!closeOnSelect) event.preventDefault();
			}}
			{...props}
		>
			<Slot.Slottable>{children}</Slot.Slottable>
			<Primitive.ItemIndicator
				aria-hidden="true"
				data-slot="dropdown-menu-checkbox-item-indicator"
				className="cn-dropdown-menu-item-indicator group/indicator pointer-events-none"
			>
				<CheckIcon className="group-data-[state=indeterminate]/indicator:hidden" />
				<MinusIcon className="hidden group-data-[state=indeterminate]/indicator:block" />
			</Primitive.ItemIndicator>
		</Primitive.CheckboxItem>
	);
}

export type DropdownMenuRadioGroupProps = React.ComponentProps<typeof Primitive.RadioGroup> & {
	defaultValue?: string;
};

export function DropdownMenuRadioGroup({
	value,
	defaultValue = "",
	onValueChange,
	...props
}: DropdownMenuRadioGroupProps) {
	const [internal, setInternal] = React.useState(defaultValue);
	return (
		<Primitive.RadioGroup
			data-slot="dropdown-menu-radio-group"
			value={value ?? internal}
			onValueChange={(next) => {
				if (value === undefined) setInternal(next);
				onValueChange?.(next);
			}}
			{...props}
		/>
	);
}

export type DropdownMenuRadioItemProps = React.ComponentProps<typeof Primitive.RadioItem> & {
	closeOnSelect?: boolean;
	inset?: boolean;
};

export function DropdownMenuRadioItem({
	className,
	children,
	inset,
	closeOnSelect = false,
	onSelect,
	...props
}: DropdownMenuRadioItemProps) {
	return (
		<Primitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			data-inset={inset || undefined}
			className={cn(
				"cn-dropdown-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			onSelect={(event) => {
				onSelect?.(event);
				if (!closeOnSelect) event.preventDefault();
			}}
			{...props}
		>
			<Slot.Slottable>{children}</Slot.Slottable>
			<Primitive.ItemIndicator
				aria-hidden="true"
				data-slot="dropdown-menu-radio-item-indicator"
				className="cn-dropdown-menu-item-indicator pointer-events-none"
			>
				<CheckIcon />
			</Primitive.ItemIndicator>
		</Primitive.RadioItem>
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

const Submenu = React.createContext<{
	close: () => void;
	trigger: HTMLDivElement | null;
	setTrigger: (node: HTMLDivElement | null) => void;
} | null>(null);

// Radix's default Escape from a child closes the entire menu; Valar closes one layer.
export function DropdownMenuSub({
	open,
	defaultOpen = false,
	onOpenChange,
	...props
}: React.ComponentProps<typeof Primitive.Sub>) {
	const [internal, setInternal] = React.useState(defaultOpen);
	const [trigger, setTrigger] = React.useState<HTMLDivElement | null>(null);
	const current = open ?? internal;
	function change(next: boolean) {
		if (next === current) return;
		if (open === undefined) setInternal(next);
		onOpenChange?.(next);
	}
	return (
		<Submenu.Provider value={{ close: () => change(false), trigger, setTrigger }}>
			<Primitive.Sub open={current} onOpenChange={change} {...props} />
		</Submenu.Provider>
	);
}

export function DropdownMenuSubTrigger({
	className,
	children,
	inset,
	ref,
	...props
}: React.ComponentProps<typeof Primitive.SubTrigger> & { inset?: boolean }) {
	const setTrigger = React.useContext(Submenu)?.setTrigger;
	const triggerRef = React.useCallback(
		(node: HTMLDivElement | null) => {
			setTrigger?.(node);
			const cleanup = typeof ref === "function" ? ref(node) : undefined;
			if (ref && typeof ref !== "function") ref.current = node;
			return () => {
				setTrigger?.(null);
				if (typeof cleanup === "function") cleanup();
				else if (typeof ref === "function") ref(null);
				else if (ref) ref.current = null;
			};
		},
		[ref, setTrigger]
	);
	return (
		<Primitive.SubTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset || undefined}
			ref={triggerRef}
			className={cn(
				"cn-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
		>
			<Slot.Slottable>{children}</Slot.Slottable>
			<ChevronRightIcon aria-hidden="true" className="ms-auto rtl:rotate-180" />
		</Primitive.SubTrigger>
	);
}

export type DropdownMenuSubContentProps = React.ComponentProps<typeof Primitive.SubContent> &
	OverlayProps;

export function DropdownMenuSubContent({
	className,
	appearance = "default",
	align = "start",
	alignOffset = -3,
	collisionPadding = 8,
	portalProps,
	forceMount,
	onEscapeKeyDown,
	...props
}: DropdownMenuSubContentProps) {
	const sub = React.useContext(Submenu);
	const content = (
		<Primitive.SubContent
			data-slot="dropdown-menu-sub-content"
			data-appearance={appearance}
			{...(sub?.trigger?.id && { "aria-labelledby": sub.trigger.id })}
			className={cn(
				"cn-dropdown-menu-sub-content cn-overlay-surface cn-dropdown-menu-surface z-50 max-h-(--radix-dropdown-menu-content-available-height) max-w-[min(var(--radix-dropdown-menu-content-available-width,100dvw),calc(100dvw-1rem))] min-w-[min(96px,var(--radix-dropdown-menu-content-available-width,100dvw),calc(100dvw-1rem))] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden data-closed:overflow-hidden",
				appearance === "surface" && "animate-none!",
				className
			)}
			align={align}
			alignOffset={alignOffset}
			collisionPadding={collisionPadding}
			forceMount={forceMount}
			onEscapeKeyDown={(event) => {
				onEscapeKeyDown?.(event);
				if (!sub || event.defaultPrevented) return;
				event.preventDefault();
				sub.trigger?.focus({ preventScroll: true });
				sub.close();
			}}
			{...props}
		/>
	);
	return portalProps === false ? (
		content
	) : (
		<DropdownMenuPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</DropdownMenuPortal>
	);
}
