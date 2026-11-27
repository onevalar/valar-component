"use client";

import * as React from "react";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { Button } from "./button.tsx";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
	type DialogContentProps,
	type DialogOverlayProps,
} from "./dialog.tsx";

export { Dialog as Sheet, DialogPortal as SheetPortal };

export function SheetTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
	return <DialogTrigger {...{ "data-slot": "sheet-trigger" }} {...props} />;
}

export function SheetClose(props: React.ComponentProps<typeof DialogClose>) {
	return <DialogClose {...{ "data-slot": "sheet-close" }} {...props} />;
}

export function SheetOverlay({ className, ...props }: DialogOverlayProps) {
	return (
		<DialogOverlay
			{...{ "data-slot": "sheet-overlay" }}
			className={cn(
				"cn-sheet-overlay fixed inset-0 z-50 duration-100 motion-reduce:animate-none! data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
				className
			)}
			{...props}
		/>
	);
}

export type SheetSide = "top" | "right" | "bottom" | "left";
export type SheetContentProps = Omit<DialogContentProps, "showOverlay" | "overlayClassName"> & {
	side?: SheetSide;
	appearance?: "default" | "details";
	showCloseButton?: boolean;
	closeLabel?: string;
};

function trapSheetTab(event: React.KeyboardEvent<HTMLDivElement>) {
	if (event.key !== "Tab" || event.defaultPrevented) return;
	const el = event.currentTarget;
	if (el.getAttribute("aria-modal") !== "true") return;
	const tabbables = Array.from(
		el.querySelectorAll<HTMLElement>(
			'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
		)
	).filter((node) => node.getClientRects().length > 0);
	if (!tabbables.length) return;
	const first = tabbables[0];
	const last = tabbables[tabbables.length - 1];
	const active = el.ownerDocument.activeElement;
	if (event.shiftKey && (active === first || active === el || !el.contains(active))) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && (active === last || !el.contains(active))) {
		event.preventDefault();
		first.focus();
	}
}

export function SheetContent({
	className,
	side = "right",
	appearance = "default",
	showCloseButton = true,
	closeLabel = "关闭",
	portalProps,
	inline,
	onKeyDown,
	children,
	...props
}: SheetContentProps) {
	const resolvedInline = inline ?? portalProps === false;
	return (
		<>
			{!resolvedInline && (
				<SheetOverlay
					className={appearance === "details" ? "cn-sheet-details-overlay" : undefined}
				/>
			)}
			<DialogContent
				{...props}
				portalProps={portalProps}
				inline={inline}
				showOverlay={false}
				showCloseButton={false}
				data-slot="sheet-content"
				data-side={side}
				data-appearance={appearance}
				onKeyDown={(event) => {
					onKeyDown?.(event);
					trapSheetTab(event);
				}}
				className={cn(
					"cn-sheet-content top-auto left-auto max-h-dvh min-h-0 translate-x-0 translate-y-0 outline-none motion-reduce:animate-none! motion-reduce:transition-none data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
					appearance === "details" && "cn-sheet-details",
					className
				)}
			>
				<Slot.Slottable>{children}</Slot.Slottable>
				{showCloseButton && (
					<SheetClose asChild>
						<Button variant="ghost" className="cn-sheet-close" size="icon-sm" aria-label={closeLabel}>
							<XIcon aria-hidden="true" />
						</Button>
					</SheetClose>
				)}
			</DialogContent>
		</>
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
