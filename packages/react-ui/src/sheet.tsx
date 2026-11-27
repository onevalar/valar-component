"use client";

import * as React from "react";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import { Dialog as Primitive, Slot } from "radix-ui";
import { Button } from "./button.tsx";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
} from "./dialog.tsx";

export { Dialog as Sheet, DialogPortal as SheetPortal };

export function SheetTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
	return <DialogTrigger {...{ "data-slot": "sheet-trigger" }} {...props} />;
}

export function SheetClose(props: React.ComponentProps<typeof DialogClose>) {
	return <DialogClose {...{ "data-slot": "sheet-close" }} {...props} />;
}

export function SheetOverlay({
	className,
	...props
}: React.ComponentProps<typeof Primitive.Overlay>) {
	return (
		<Primitive.Overlay
			data-slot="sheet-overlay"
			className={cn(
				"cn-sheet-overlay fixed inset-0 z-50 duration-100 motion-reduce:animate-none! data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
				className
			)}
			{...props}
		/>
	);
}

export type SheetSide = "top" | "right" | "bottom" | "left";
export type SheetContentProps = React.ComponentProps<typeof Primitive.Content> & {
	side?: SheetSide;
	appearance?: "default" | "details";
	showCloseButton?: boolean;
	closeLabel?: string;
	portalProps?: false | Omit<React.ComponentProps<typeof DialogPortal>, "children">;
};

export function SheetContent({
	className,
	side = "right",
	appearance = "default",
	showCloseButton = true,
	closeLabel = "关闭",
	portalProps,
	forceMount,
	children,
	...props
}: SheetContentProps) {
	const content = (
		<Primitive.Content
			data-slot="sheet-content"
			data-side={side}
			data-appearance={appearance}
			className={cn(
				"cn-sheet-content max-h-dvh min-h-0 outline-none motion-reduce:animate-none! motion-reduce:transition-none data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
				appearance === "details" && "cn-sheet-details",
				className
			)}
			forceMount={forceMount}
			{...props}
		>
			<Slot.Slottable>{children}</Slot.Slottable>
			{showCloseButton && (
				<SheetClose asChild>
					<Button variant="ghost" className="cn-sheet-close" size="icon-sm" aria-label={closeLabel}>
						<XIcon aria-hidden="true" />
					</Button>
				</SheetClose>
			)}
		</Primitive.Content>
	);
	return portalProps === false ? (
		content
	) : (
		<DialogPortal {...portalProps} forceMount={forceMount ?? portalProps?.forceMount}>
			<SheetOverlay className={appearance === "details" ? "cn-sheet-details-overlay" : undefined} />
			{content}
		</DialogPortal>
	);
}

export function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn("cn-sheet-header flex flex-col", className)}
			{...props}
		/>
	);
}

export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn("cn-sheet-footer mt-auto flex flex-col", className)}
			{...props}
		/>
	);
}

export function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
	return (
		<DialogTitle
			{...{ "data-slot": "sheet-title" }}
			className={cn("cn-sheet-title", className)}
			{...props}
		/>
	);
}

export function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogDescription>) {
	return (
		<DialogDescription
			{...{ "data-slot": "sheet-description" }}
			className={cn("cn-sheet-description", className)}
			{...props}
		/>
	);
}

export type SheetPanelProps = Omit<React.ComponentProps<"section">, "hidden"> & {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	label: string;
	trigger?: HTMLElement | React.RefObject<HTMLElement | null> | null;
};

export function SheetPanel({
	open,
	onOpenChange,
	label,
	trigger,
	className,
	children,
	ref,
	...props
}: SheetPanelProps) {
	const panel = React.useRef<HTMLElement>(null);
	const focusOnClose = React.useRef(false);
	React.useImperativeHandle(ref, () => panel.current!, []);

	React.useEffect(() => {
		const section = panel.current;
		if (!open || !section) return;
		const view = section.ownerDocument.defaultView;
		function handleEscape(event: KeyboardEvent) {
			if (
				event.key !== "Escape" ||
				event.defaultPrevented ||
				event.isComposing ||
				!(event.target instanceof Node) ||
				!section?.contains(event.target)
			)
				return;
			event.preventDefault();
			focusOnClose.current = section.contains(section.ownerDocument.activeElement);
			onOpenChange(false);
		}
		// Radix's inner dismissable layers process Escape on the document first.
		view?.addEventListener("keydown", handleEscape);
		return () => view?.removeEventListener("keydown", handleEscape);
	}, [open, onOpenChange]);

	React.useLayoutEffect(() => {
		if (open || !focusOnClose.current) return;
		focusOnClose.current = false;
		const section = panel.current;
		const active = section?.ownerDocument.activeElement;
		if (!section || (active !== section.ownerDocument.body && !section.contains(active ?? null)))
			return;
		const target = trigger && ("current" in trigger ? trigger.current : trigger);
		target?.focus({ preventScroll: true });
	}, [open, trigger]);

	return (
		<section
			aria-label={label}
			data-slot="sheet-panel"
			data-state={open ? "open" : "closed"}
			className={cn("cn-sheet-panel cn-sheet-details data-[state=closed]:hidden", className)}
			{...props}
			ref={panel}
			hidden={!open}
		>
			{open && (
				<div data-slot="sheet-panel-scroll" className="cn-sheet-panel-scroll pe-[11px]">
					{children}
				</div>
			)}
		</section>
	);
}
