"use client";

import * as React from "react";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";
import { ContextMenu as Primitive, Slot } from "radix-ui";
import { Kbd } from "./kbd.tsx";
import { Separator } from "./separator.tsx";

export const ContextMenu = Primitive.Root;
export const ContextMenuPortal = Primitive.Portal;

type PortalProps = {
	portalProps?: false | Omit<React.ComponentProps<typeof ContextMenuPortal>, "children">;
};

export function ContextMenuTrigger({
	className,
	onKeyDown,
	disabled,
	...props
}: React.ComponentProps<typeof Primitive.Trigger>) {
	return (
		<Primitive.Trigger
			data-slot="context-menu-trigger"
			className={cn(
				"select-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring",
				className
			)}
			disabled={disabled}
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
				// Feed the same point anchor as a native contextmenu, without replacing Radix's pointer gestures.
				target.dispatchEvent(
					new MouseEvent("contextmenu", {
						bubbles: true,
						cancelable: true,
						button: 2,
						clientX: bounds.left + Math.min(16, bounds.width / 2),
						clientY: bounds.bottom - Math.min(8, bounds.height / 2),
					})
				);
			}}
			{...props}
		/>
	);
}

export type ContextMenuContentProps = React.ComponentProps<typeof Primitive.Content> & PortalProps;

export function ContextMenuContent({
	className,
	collisionPadding = 8,
	portalProps,
	forceMount,
	...props
}: ContextMenuContentProps) {
	const content = (
		<Primitive.Content
			data-slot="context-menu-content"
			className={cn(
				"cn-context-menu-content cn-overlay-surface cn-context-menu-surface z-50 max-h-(--radix-context-menu-content-available-height) max-w-[min(var(--radix-context-menu-content-available-width,100dvw),calc(100dvw-1rem))] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden [--bits-floating-available-width:var(--radix-context-menu-content-available-width)]",
				className
			)}
			collisionPadding={collisionPadding}
			forceMount={forceMount}
			{...props}
		/>
	);
	return portalProps === false ? (
		content
	) : (
		<ContextMenuPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</ContextMenuPortal>
	);
}

export function ContextMenuGroup(props: React.ComponentProps<typeof Primitive.Group>) {
	return <Primitive.Group data-slot="context-menu-group" {...props} />;
}

type LabelProps = React.ComponentProps<typeof Primitive.Label> & { inset?: boolean };

export function ContextMenuLabel({ className, inset, ...props }: LabelProps) {
	return (
		<Primitive.Label
			data-slot="context-menu-label"
			data-inset={inset || undefined}
			className={cn("cn-context-menu-label", className)}
			{...props}
		/>
	);
}

export function ContextMenuGroupHeading(props: LabelProps) {
	return <ContextMenuLabel data-slot="context-menu-group-heading" {...props} />;
}

export type ContextMenuItemProps = React.ComponentProps<typeof Primitive.Item> & {
	inset?: boolean;
	variant?: "default" | "destructive";
	closeOnSelect?: boolean;
};

export function ContextMenuItem({
	className,
	inset,
	variant = "default",
	closeOnSelect = true,
	onSelect,
	...props
}: ContextMenuItemProps) {
	return (
		<Primitive.Item
			data-slot="context-menu-item"
			data-inset={inset || undefined}
			data-variant={variant}
			className={cn(
				"cn-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
export type ContextMenuCheckboxItemProps = React.ComponentProps<typeof Primitive.CheckboxItem> & {
	defaultChecked?: Checked;
	closeOnSelect?: boolean;
	inset?: boolean;
};

export function ContextMenuCheckboxItem({
	className,
	checked,
	defaultChecked = false,
	children,
	inset,
	closeOnSelect = false,
	onSelect,
	onCheckedChange,
	...props
}: ContextMenuCheckboxItemProps) {
	const [internal, setInternal] = React.useState(defaultChecked);
	return (
		<Primitive.CheckboxItem
			data-slot="context-menu-checkbox-item"
			data-inset={inset || undefined}
			className={cn(
				"cn-context-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
				data-slot="context-menu-item-indicator"
				className="cn-context-menu-item-indicator group/indicator pointer-events-none"
			>
				<CheckIcon className="group-data-[state=indeterminate]/indicator:hidden" />
				<MinusIcon className="hidden group-data-[state=indeterminate]/indicator:block" />
			</Primitive.ItemIndicator>
		</Primitive.CheckboxItem>
	);
}

export type ContextMenuRadioGroupProps = React.ComponentProps<typeof Primitive.RadioGroup> & {
	defaultValue?: string;
};

export function ContextMenuRadioGroup({
	value,
	defaultValue = "",
	onValueChange,
	...props
}: ContextMenuRadioGroupProps) {
	const [internal, setInternal] = React.useState(defaultValue);
	return (
		<Primitive.RadioGroup
			data-slot="context-menu-radio-group"
			value={value ?? internal}
			onValueChange={(next) => {
				if (value === undefined) setInternal(next);
				onValueChange?.(next);
			}}
			{...props}
		/>
	);
}

export type ContextMenuRadioItemProps = React.ComponentProps<typeof Primitive.RadioItem> & {
	closeOnSelect?: boolean;
	inset?: boolean;
};

export function ContextMenuRadioItem({
	className,
	children,
	inset,
	closeOnSelect = false,
	onSelect,
	...props
}: ContextMenuRadioItemProps) {
	return (
		<Primitive.RadioItem
			data-slot="context-menu-radio-item"
			data-inset={inset || undefined}
			className={cn(
				"cn-context-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
				data-slot="context-menu-item-indicator"
				className="cn-context-menu-item-indicator pointer-events-none"
			>
				<CheckIcon />
			</Primitive.ItemIndicator>
		</Primitive.RadioItem>
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

const Submenu = React.createContext<{
	close: () => void;
	trigger: HTMLDivElement | null;
	setTrigger: (node: HTMLDivElement | null) => void;
} | null>(null);

export function ContextMenuSub({
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

export function ContextMenuSubTrigger({
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
			data-slot="context-menu-sub-trigger"
			data-inset={inset || undefined}
			ref={triggerRef}
			className={cn(
				"cn-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
		>
			<Slot.Slottable>{children}</Slot.Slottable>
			<ChevronRightIcon aria-hidden="true" className="ms-auto rtl:rotate-180" />
		</Primitive.SubTrigger>
	);
}

export type ContextMenuSubContentProps = React.ComponentProps<typeof Primitive.SubContent> &
	PortalProps & { elevated?: boolean };

export function ContextMenuSubContent({
	className,
	elevated = false,
	align = "start",
	alignOffset = -3,
	collisionPadding = 8,
	portalProps,
	forceMount,
	onEscapeKeyDown,
	...props
}: ContextMenuSubContentProps) {
	const sub = React.useContext(Submenu);
	const content = (
		<Primitive.SubContent
			data-slot="context-menu-sub-content"
			data-elevated={elevated || undefined}
			{...(sub?.trigger?.id && { "aria-labelledby": sub.trigger.id })}
			className={cn(
				"cn-context-menu-sub-content cn-overlay-surface cn-context-menu-surface z-50 max-h-(--radix-context-menu-content-available-height) max-w-[min(var(--radix-context-menu-content-available-width,100dvw),calc(100dvw-1rem))] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden [--bits-floating-available-width:var(--radix-context-menu-content-available-width)]",
				elevated && "cn-context-menu-sub-elevated",
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
		<ContextMenuPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			{content}
		</ContextMenuPortal>
	);
}
