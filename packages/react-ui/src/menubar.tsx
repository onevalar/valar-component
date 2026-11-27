"use client";

import * as React from "react";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";
import { Menubar as Primitive, Slot } from "radix-ui";
import { Kbd } from "./kbd.tsx";
import { Separator } from "./separator.tsx";

export const MenubarMenu = Primitive.Menu;
export const MenubarPortal = Primitive.Portal;

type PortalProps = {
	portalProps?: false | Omit<React.ComponentProps<typeof MenubarPortal>, "children">;
};

export function Menubar({ className, ...props }: React.ComponentProps<typeof Primitive.Root>) {
	return (
		<Primitive.Root
			data-slot="menubar"
			className={cn("cn-menubar flex items-center", className)}
			{...props}
		/>
	);
}

export function MenubarTrigger({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Trigger>) {
	return (
		<Primitive.Trigger
			data-slot="menubar-trigger"
			className={cn(
				"cn-menubar-trigger flex items-center outline-hidden select-none disabled:opacity-50",
				className
			)}
			{...props}
		/>
	);
}

export type MenubarContentProps = React.ComponentProps<typeof Primitive.Content> & PortalProps;

export function MenubarContent({
	className,
	side = "bottom",
	sideOffset = 8,
	align = "start",
	alignOffset = -4,
	collisionPadding = 8,
	portalProps,
	forceMount,
	...props
}: MenubarContentProps) {
	const content = (
		<Primitive.Content
			data-slot="menubar-content"
			className={cn(
				"cn-menubar-content z-50 max-h-(--radix-menubar-content-available-height) max-w-[min(var(--radix-menubar-content-available-width,100dvw),calc(100dvw-1rem))] min-w-[min(9rem,var(--radix-menubar-content-available-width,100dvw),calc(100dvw-1rem))] origin-(--radix-menubar-content-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden",
				className
			)}
			side={side}
			sideOffset={sideOffset}
			align={align}
			alignOffset={alignOffset}
			collisionPadding={collisionPadding}
			forceMount={forceMount}
			{...props}
		/>
	);
	return portalProps === false ? (
		content
	) : (
		<MenubarPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</MenubarPortal>
	);
}

export function MenubarGroup(props: React.ComponentProps<typeof Primitive.Group>) {
	return <Primitive.Group data-slot="menubar-group" {...props} />;
}

type LabelProps = React.ComponentProps<typeof Primitive.Label> & { inset?: boolean };

export function MenubarLabel({ className, inset, ...props }: LabelProps) {
	return (
		<Primitive.Label
			data-slot="menubar-label"
			data-inset={inset || undefined}
			className={cn("cn-menubar-label data-inset:ps-7 data-inset:pe-1.5", className)}
			{...props}
		/>
	);
}

export function MenubarGroupHeading(props: LabelProps) {
	return <MenubarLabel data-slot="menubar-group-heading" {...props} />;
}

export type MenubarItemProps = React.ComponentProps<typeof Primitive.Item> & {
	inset?: boolean;
	variant?: "default" | "destructive";
	closeOnSelect?: boolean;
};

export function MenubarItem({
	className,
	inset,
	variant = "default",
	closeOnSelect = true,
	onSelect,
	...props
}: MenubarItemProps) {
	return (
		<Primitive.Item
			data-slot="menubar-item"
			data-inset={inset || undefined}
			data-variant={variant}
			className={cn(
				"cn-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-inset:ps-7 data-inset:pe-1.5 data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
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

type Checked = NonNullable<React.ComponentProps<typeof Primitive.CheckboxItem>["checked"]>;
export type MenubarCheckboxItemProps = React.ComponentProps<typeof Primitive.CheckboxItem> & {
	defaultChecked?: Checked;
	closeOnSelect?: boolean;
	inset?: boolean;
};

export function MenubarCheckboxItem({
	className,
	checked,
	defaultChecked = false,
	children,
	inset,
	closeOnSelect = false,
	onSelect,
	onCheckedChange,
	...props
}: MenubarCheckboxItemProps) {
	const [internal, setInternal] = React.useState(defaultChecked);
	return (
		<Primitive.CheckboxItem
			data-slot="menubar-checkbox-item"
			data-inset={inset || undefined}
			className={cn(
				"cn-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			checked={checked ?? internal}
			onCheckedChange={(next) => {
				if (checked === undefined) setInternal(next);
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
				data-slot="menubar-checkbox-item-indicator"
				className="cn-menubar-checkbox-item-indicator group/indicator pointer-events-none absolute flex items-center justify-center"
			>
				<CheckIcon className="group-data-[state=indeterminate]/indicator:hidden" />
				<MinusIcon className="hidden group-data-[state=indeterminate]/indicator:block" />
			</Primitive.ItemIndicator>
		</Primitive.CheckboxItem>
	);
}

export type MenubarRadioGroupProps = React.ComponentProps<typeof Primitive.RadioGroup> & {
	defaultValue?: string;
};

export function MenubarRadioGroup({
	value,
	defaultValue = "",
	onValueChange,
	...props
}: MenubarRadioGroupProps) {
	const [internal, setInternal] = React.useState(defaultValue);
	return (
		<Primitive.RadioGroup
			data-slot="menubar-radio-group"
			value={value ?? internal}
			onValueChange={(next) => {
				if (value === undefined) setInternal(next);
				onValueChange?.(next);
			}}
			{...props}
		/>
	);
}

export type MenubarRadioItemProps = React.ComponentProps<typeof Primitive.RadioItem> & {
	closeOnSelect?: boolean;
	inset?: boolean;
};

export function MenubarRadioItem({
	className,
	children,
	inset,
	closeOnSelect = false,
	onSelect,
	...props
}: MenubarRadioItemProps) {
	return (
		<Primitive.RadioItem
			data-slot="menubar-radio-item"
			data-inset={inset || undefined}
			className={cn(
				"cn-menubar-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
				data-slot="menubar-radio-item-indicator"
				className="cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center"
			>
				<CheckIcon />
			</Primitive.ItemIndicator>
		</Primitive.RadioItem>
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

const Submenu = React.createContext<{
	close: () => void;
	trigger: HTMLDivElement | null;
	setTrigger: (node: HTMLDivElement | null) => void;
} | null>(null);

export function MenubarSub({
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

export function MenubarSubTrigger({
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
			data-slot="menubar-sub-trigger"
			data-inset={inset || undefined}
			ref={triggerRef}
			className={cn(
				"cn-menubar-sub-trigger flex cursor-default items-center outline-none select-none data-inset:ps-7 data-inset:pe-1.5 data-disabled:pointer-events-none data-disabled:opacity-50",
				className
			)}
			{...props}
		>
			<Slot.Slottable>{children}</Slot.Slottable>
			<ChevronRightIcon aria-hidden="true" className="ms-auto size-4 rtl:rotate-180" />
		</Primitive.SubTrigger>
	);
}

export type MenubarSubContentProps = React.ComponentProps<typeof Primitive.SubContent> &
	PortalProps;

export function MenubarSubContent({
	className,
	align = "start",
	alignOffset = -3,
	collisionPadding = 8,
	portalProps,
	forceMount,
	onEscapeKeyDown,
	...props
}: MenubarSubContentProps) {
	const sub = React.useContext(Submenu);
	const content = (
		<Primitive.SubContent
			data-slot="menubar-sub-content"
			{...(sub?.trigger?.id && { "aria-labelledby": sub.trigger.id })}
			className={cn(
				"cn-menubar-sub-content z-50 max-h-(--radix-menubar-content-available-height) max-w-[min(var(--radix-menubar-content-available-width,100dvw),calc(100dvw-1rem))] min-w-[min(8rem,var(--radix-menubar-content-available-width,100dvw),calc(100dvw-1rem))] origin-(--radix-menubar-content-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden",
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
		<MenubarPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</MenubarPortal>
	);
}
