"use client";

import * as React from "react";
import { cn } from "cn";
import { PanelLeftIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { Button, type ButtonProps } from "./button.tsx";
import { Input } from "./input.tsx";
import { Separator } from "./separator.tsx";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet.tsx";
import { Skeleton } from "./skeleton.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip.tsx";

export const SIDEBAR_COOKIE_NAME = "sidebar_state";
const mobileQuery = "(width < 48rem)";
const editor = 'input, textarea, [contenteditable]:not([contenteditable="false" i])';
const subscribe = (notify: () => void) => {
	const query = window.matchMedia(mobileQuery);
	query.addEventListener("change", notify);
	return () => query.removeEventListener("change", notify);
};

type SidebarAppearance = "default" | "workspace";
type SidebarState = {
	open: boolean;
	state: "expanded" | "collapsed";
	setOpen: (value: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (value: boolean) => void;
	isMobile: boolean;
	appearance: SidebarAppearance;
	toggle: (opener?: HTMLElement) => void;
};
const SidebarContext = React.createContext<
	| (SidebarState & {
			mobileOpener: React.RefObject<HTMLElement | null>;
	  })
	| null
>(null);

export function useSidebar() {
	const state = React.useContext(SidebarContext);
	if (!state) throw new Error("Sidebar parts require a SidebarProvider");
	return state;
}

export type SidebarProviderProps = React.ComponentProps<"div"> & {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	keyboardShortcut?: boolean;
	persistState?: boolean;
	appearance?: SidebarAppearance;
};

export function SidebarProvider({
	open: controlled,
	defaultOpen = true,
	onOpenChange,
	keyboardShortcut = true,
	persistState = true,
	appearance = "default",
	className,
	style,
	children,
	...props
}: SidebarProviderProps) {
	const isMobile = React.useSyncExternalStore(
		subscribe,
		() => window.matchMedia(mobileQuery).matches,
		() => false
	);
	const [local, setLocal] = React.useState(defaultOpen);
	const [openMobile, setOpenMobile] = React.useState(false);
	const mobileOpener = React.useRef<HTMLElement | null>(null);
	const open = controlled ?? local;
	const setOpen = React.useCallback(
		(next: boolean) => {
			if (next === open) return;
			if (controlled === undefined) setLocal(next);
			onOpenChange?.(next);
			if (persistState)
				document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=604800; SameSite=Lax`;
		},
		[open, controlled, onOpenChange, persistState]
	);
	const toggle = React.useCallback(
		(opener?: HTMLElement) => {
			if (isMobile) {
				if (!openMobile) mobileOpener.current = opener ?? null;
				setOpenMobile(!openMobile);
			} else setOpen(!open);
		},
		[isMobile, openMobile, setOpen, open]
	);
	React.useEffect(() => {
		if (!keyboardShortcut) return;
		function onKeydown(event: KeyboardEvent) {
			if (
				event.defaultPrevented ||
				event.repeat ||
				event.isComposing ||
				event.altKey ||
				event.key !== "b" ||
				!(event.metaKey || event.ctrlKey)
			)
				return;
			if (
				event.composedPath().some((target) => target instanceof Element && target.matches(editor))
			)
				return;
			event.preventDefault();
			toggle(document.activeElement instanceof HTMLElement ? document.activeElement : undefined);
		}
		window.addEventListener("keydown", onKeydown);
		return () => window.removeEventListener("keydown", onKeydown);
	}, [keyboardShortcut, toggle]);
	React.useEffect(() => {
		if (!isMobile) setOpenMobile(false);
	}, [isMobile]);
	return (
		<SidebarContext.Provider
			value={{
				open,
				state: open ? "expanded" : "collapsed",
				setOpen,
				openMobile,
				setOpenMobile,
				isMobile,
				appearance,
				toggle,
				mobileOpener,
			}}
		>
			<TooltipProvider delayDuration={0}>
				<div
					data-slot="sidebar-wrapper"
					data-appearance={appearance}
					className={cn(
						"group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
						appearance === "workspace" && "cn-sidebar-workspace bg-sidebar",
						className
					)}
					style={
						{
							"--sidebar-width": `var(--sidebar-width-default, ${appearance === "workspace" ? "192px" : "16rem"})`,
							"--sidebar-width-icon": "3rem",
							...style,
						} as React.CSSProperties
					}
					{...props}
				>
					{children}
				</div>
			</TooltipProvider>
		</SidebarContext.Provider>
	);
}

export type SidebarProps = React.ComponentProps<"div"> & {
	side?: "left" | "right";
	variant?: "sidebar" | "floating" | "inset";
	collapsible?: "offcanvas" | "icon" | "none";
	mobileTitle?: string;
	mobileDescription?: string;
	mobileCloseButton?: boolean;
};

export function Sidebar({
	side = "left",
	variant = "sidebar",
	collapsible = "offcanvas",
	mobileTitle = "侧边栏",
	mobileDescription = "显示移动端侧边栏。",
	mobileCloseButton = true,
	className,
	style,
	id,
	ref,
	children,
	...props
}: SidebarProps) {
	const sidebar = useSidebar();
	if (collapsible === "none") {
		return (
			<div
				data-slot="sidebar"
				data-sidebar="sidebar"
				ref={ref}
				id={id}
				style={style}
				className={cn(
					"flex h-full w-(--sidebar-width) max-w-full flex-col bg-sidebar text-sidebar-foreground",
					className
				)}
				{...props}
			>
				{children}
			</div>
		);
	}
	if (sidebar.isMobile) {
		return (
			<Sheet open={sidebar.openMobile} onOpenChange={sidebar.setOpenMobile}>
				<SheetContent
					{...props}
					data-slot="sidebar"
					data-sidebar="sidebar"
					data-mobile="true"
					ref={ref}
					id={id}
					side={side}
					showCloseButton={mobileCloseButton}
					className={cn(
						"w-(--sidebar-width)! max-w-full! gap-0 bg-sidebar! p-0 text-sidebar-foreground!",
						sidebar.appearance === "workspace" && "cn-sidebar-workspace",
						className
					)}
					style={{ "--sidebar-width": "18rem", ...style } as React.CSSProperties}
					onCloseAutoFocus={(event) => {
						const opener = sidebar.mobileOpener.current;
						sidebar.mobileOpener.current = null;
						if (opener?.isConnected) {
							event.preventDefault();
							opener.focus();
						}
					}}
				>
					<SheetHeader className="sr-only">
						<SheetTitle>{mobileTitle}</SheetTitle>
						<SheetDescription>{mobileDescription}</SheetDescription>
					</SheetHeader>
					<div className="flex h-full min-h-0 w-full flex-col">{children}</div>
				</SheetContent>
			</Sheet>
		);
	}
	const padded = variant !== "sidebar";
	return (
		<div
			ref={ref}
			id={id}
			data-slot="sidebar"
			data-side={side}
			data-variant={variant}
			data-state={sidebar.state}
			data-collapsible={sidebar.open ? "" : collapsible}
			className="group peer hidden shrink-0 text-sidebar-foreground md:block"
		>
			<div
				data-slot="sidebar-gap"
				className={cn(
					"cn-sidebar-gap relative w-(--sidebar-width) group-data-[collapsible=offcanvas]:w-0 motion-reduce:transition-none",
					padded
						? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
						: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
				)}
			/>
			<div
				data-slot="sidebar-container"
				data-side={side}
				style={style}
				inert={collapsible === "offcanvas" && !sidebar.open}
				className={cn(
					"fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:start-0 data-[side=left]:group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)] data-[side=right]:end-0 data-[side=right]:group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)] motion-reduce:transition-none md:flex",
					padded
						? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
						: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
					!padded &&
						sidebar.appearance === "default" &&
						"group-data-[side=left]:border-e group-data-[side=right]:border-s",
					className
				)}
				{...props}
			>
				<div
					data-slot="sidebar-inner"
					data-sidebar="sidebar"
					className="cn-sidebar-inner flex size-full flex-col"
				>
					{children}
				</div>
			</div>
		</div>
	);
}

function sidebarPart<Tag extends "div" | "ul" | "li" | "main" | "button" | "a">(
	Tag: Tag,
	part: string,
	classes: string
) {
	function Part({
		asChild,
		className,
		...props
	}: React.ComponentProps<Tag> & { asChild?: boolean }) {
		const Component: React.ElementType = asChild ? Slot.Root : Tag;
		return (
			<Component
				data-slot={`sidebar-${part}`}
				data-sidebar={part}
				className={cn(classes, className)}
				type={!asChild && Tag === "button" ? "button" : undefined}
				{...props}
			/>
		);
	}
	return Part;
}

export const SidebarHeader = sidebarPart("div", "header", "cn-sidebar-header flex flex-col");
export const SidebarFooter = sidebarPart("div", "footer", "cn-sidebar-footer flex flex-col");
export const SidebarContent = sidebarPart(
	"div",
	"content",
	"cn-sidebar-content flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto group-data-[collapsible=icon]:overflow-hidden"
);
export const SidebarInset = sidebarPart(
	"main",
	"inset",
	"cn-sidebar-inset relative flex min-w-0 w-full flex-1 flex-col"
);
export const SidebarGroup = sidebarPart(
	"div",
	"group",
	"cn-sidebar-group relative flex w-full min-w-0 flex-col"
);
export const SidebarGroupLabel = sidebarPart(
	"div",
	"group-label",
	"cn-sidebar-group-label flex shrink-0 items-center outline-hidden group-data-[collapsible=icon]:invisible [&>svg]:shrink-0"
);
export const SidebarGroupAction = sidebarPart(
	"button",
	"group-action",
	"cn-sidebar-group-action flex aspect-square items-center justify-center outline-hidden group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0"
);
export const SidebarGroupContent = sidebarPart(
	"div",
	"group-content",
	"cn-sidebar-group-content w-full"
);
export const SidebarMenu = sidebarPart(
	"ul",
	"menu",
	"cn-sidebar-menu flex w-full min-w-0 flex-col"
);
export const SidebarMenuItem = sidebarPart("li", "menu-item", "group/menu-item relative");
export const SidebarMenuBadge = sidebarPart(
	"div",
	"menu-badge",
	"cn-sidebar-menu-badge flex items-center justify-center tabular-nums select-none group-data-[collapsible=icon]:hidden"
);
export const SidebarMenuSub = sidebarPart(
	"ul",
	"menu-sub",
	"cn-sidebar-menu-sub flex min-w-0 flex-col group-data-[collapsible=icon]:hidden"
);
export const SidebarMenuSubItem = sidebarPart(
	"li",
	"menu-sub-item",
	"group/menu-sub-item relative"
);

export function SidebarInput({ className, ...props }: React.ComponentProps<typeof Input>) {
	return (
		<Input
			data-slot="sidebar-input"
			data-sidebar="input"
			className={cn("cn-sidebar-input", className)}
			{...props}
		/>
	);
}

export function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			decorative
			data-slot="sidebar-separator"
			data-sidebar="separator"
			className={cn("cn-sidebar-separator w-auto data-[orientation=horizontal]:w-auto", className)}
			{...props}
		/>
	);
}

export function SidebarTrigger({
	className,
	label = "切换侧边栏",
	onClick,
	children,
	...props
}: Extract<ButtonProps, { href?: never }> & { label?: string }) {
	const sidebar = useSidebar();
	return (
		<Button
			data-slot="sidebar-trigger"
			data-sidebar="trigger"
			variant="ghost"
			size="icon-sm"
			className={className}
			aria-expanded={sidebar.isMobile ? sidebar.openMobile : sidebar.open}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) sidebar.toggle(event.currentTarget);
			}}
			{...props}
		>
			{children ?? (
				<>
					<PanelLeftIcon className="rtl:-scale-x-100" aria-hidden="true" />
					<span className="sr-only">{label}</span>
				</>
			)}
		</Button>
	);
}

export function SidebarRail({ className, onClick, ...props }: React.ComponentProps<"button">) {
	const sidebar = useSidebar();
	return (
		<button
			data-slot="sidebar-rail"
			data-sidebar="rail"
			type="button"
			tabIndex={-1}
			aria-label="切换侧边栏"
			title="切换侧边栏"
			className={cn(
				"cn-sidebar-rail absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-end-2 group-data-[side=right]:-start-2 after:absolute after:inset-y-0 after:start-1/2 after:w-0.5 in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize motion-reduce:transition-none sm:flex",
				className
			)}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) sidebar.toggle(event.currentTarget);
			}}
			{...props}
		/>
	);
}

const MenuButton = sidebarPart(
	"button",
	"menu-button",
	"cn-sidebar-menu-button peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate"
);
export type SidebarMenuButtonProps = React.ComponentProps<typeof MenuButton> & {
	isActive?: boolean;
	variant?: "default" | "outline";
	size?: "default" | "sm" | "lg";
	tooltipContent?: React.ReactNode;
	tooltipContentProps?: Omit<React.ComponentProps<typeof TooltipContent>, "children">;
};
const menuVariants = {
	default: "cn-sidebar-menu-button-variant-default",
	outline: "cn-sidebar-menu-button-variant-outline",
};
const menuSizes = {
	default: "cn-sidebar-menu-button-size-default",
	sm: "cn-sidebar-menu-button-size-sm",
	lg: "cn-sidebar-menu-button-size-lg",
};

export function SidebarMenuButton({
	isActive = false,
	variant = "default",
	size = "default",
	tooltipContent,
	tooltipContentProps,
	className,
	...props
}: SidebarMenuButtonProps) {
	const sidebar = useSidebar();
	const button = (
		<MenuButton
			data-active={isActive}
			data-variant={variant}
			data-size={size}
			className={cn(menuVariants[variant], menuSizes[size], className)}
			{...props}
		/>
	);
	return !tooltipContent ? (
		button
	) : (
		<Tooltip disabled={sidebar.isMobile || sidebar.open}>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent side="right" {...tooltipContentProps}>
				{tooltipContent}
			</TooltipContent>
		</Tooltip>
	);
}

const MenuAction = sidebarPart(
	"button",
	"menu-action",
	"cn-sidebar-menu-action flex items-center justify-center outline-hidden group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0"
);
export function SidebarMenuAction({
	showOnHover,
	className,
	...props
}: React.ComponentProps<typeof MenuAction> & { showOnHover?: boolean }) {
	return (
		<MenuAction
			className={cn(
				showOnHover &&
					"group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 md:opacity-0",
				className
			)}
			{...props}
		/>
	);
}

export function SidebarMenuSkeleton({
	showIcon,
	className,
	children,
	...props
}: React.ComponentProps<"div"> & { showIcon?: boolean }) {
	return (
		<div
			data-slot="sidebar-menu-skeleton"
			data-sidebar="menu-skeleton"
			className={cn("cn-sidebar-menu-skeleton flex items-center", className)}
			{...props}
		>
			{showIcon && (
				<Skeleton data-sidebar="menu-skeleton-icon" className="cn-sidebar-menu-skeleton-icon" />
			)}
			<Skeleton
				data-sidebar="menu-skeleton-text"
				className="cn-sidebar-menu-skeleton-text max-w-[70%] flex-1"
			/>
			{children}
		</div>
	);
}

const MenuSubButton = sidebarPart(
	"a",
	"menu-sub-button",
	"cn-sidebar-menu-sub-button flex min-w-0 items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0"
);
export function SidebarMenuSubButton({
	size = "md",
	isActive = false,
	...props
}: React.ComponentProps<typeof MenuSubButton> & { size?: "sm" | "md"; isActive?: boolean }) {
	return <MenuSubButton data-size={size} data-active={isActive} {...props} />;
}
