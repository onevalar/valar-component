import { PanelLeftIcon } from "@lucide/vue";
import { cn } from "cn";
import { Primitive, useForwardExpose, type PrimitiveProps } from "reka-ui";
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue";
import { useSidebar } from "./context.js";
import { Button } from "../button/index.js";
import { Input } from "../input/index.js";
import { Separator } from "../separator/index.js";
import { Skeleton } from "../skeleton/index.js";

export { SIDEBAR_COOKIE_NAME, useSidebar } from "./context.js";
export { default as Sidebar } from "./Sidebar.vue";
export { default as SidebarProvider } from "./SidebarProvider.vue";
export { default as SidebarMenuButton } from "./SidebarMenuButton.vue";

type PartProps = PrimitiveProps & { class?: HTMLAttributes["class"] };
function sidebarPart(as: PrimitiveProps["as"], name: string, classes: string) {
	return defineComponent(
		(_props: PartProps, { attrs, slots }) => {
			const { forwardRef } = useForwardExpose();
			return () =>
				h(
					Primitive,
					{
						as,
						type:
							as === "button" &&
							attrs.as === undefined &&
							attrs.asChild === undefined &&
							attrs["as-child"] === undefined
								? "button"
								: undefined,
						...attrs,
						ref: forwardRef,
						"data-slot": `sidebar-${name}`,
						"data-sidebar": name,
						class: cn(classes, attrs.class as HTMLAttributes["class"]),
					},
					slots
				);
		},
		{ name: `Sidebar-${name}`, inheritAttrs: false }
	);
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

export const SidebarInput = defineComponent(
	(_props: InstanceType<typeof Input>["$props"], { attrs }) => {
		const { forwardRef } = useForwardExpose();
		return () =>
			h(Input, {
				...attrs,
				ref: forwardRef,
				"data-slot": "sidebar-input",
				"data-sidebar": "input",
				class: cn("cn-sidebar-input", attrs.class as HTMLAttributes["class"]),
			});
	},
	{ name: "SidebarInput", inheritAttrs: false }
);

export const SidebarSeparator = defineComponent(
	(_props: InstanceType<typeof Separator>["$props"], { attrs }) => {
		const { forwardRef } = useForwardExpose();
		return () =>
			h(Separator, {
				decorative: true,
				...attrs,
				ref: forwardRef,
				"data-slot": "sidebar-separator",
				"data-sidebar": "separator",
				class: cn(
					"cn-sidebar-separator w-auto data-[orientation=horizontal]:w-auto",
					attrs.class as HTMLAttributes["class"]
				),
			});
	},
	{ name: "SidebarSeparator", inheritAttrs: false }
);

type Click = { onClick?: (event: MouseEvent) => void };

export const SidebarTrigger = defineComponent(
	(props: InstanceType<typeof Button>["$props"] & Click & { label?: string }, { attrs, slots }) => {
		const sidebar = useSidebar();
		const { forwardRef } = useForwardExpose();
		return () =>
			h(
				Button,
				{
					variant: "ghost",
					size: "icon-sm",
					"aria-expanded": sidebar.isMobile.value ? sidebar.openMobile.value : sidebar.open.value,
					...attrs,
					ref: forwardRef,
					"data-slot": "sidebar-trigger",
					"data-sidebar": "trigger",
					onClick: (event: MouseEvent) => {
						props.onClick?.(event);
						if (!event.defaultPrevented) sidebar.toggle(event.currentTarget as HTMLElement);
					},
				},
				{
					default:
						slots.default ??
						(() => [
							h(PanelLeftIcon, { class: "rtl:-scale-x-100", "aria-hidden": "true" }),
							h("span", { class: "sr-only" }, props.label ?? "切换侧边栏"),
						]),
				}
			);
	},
	{ name: "SidebarTrigger", props: ["label", "onClick"], inheritAttrs: false }
);

export const SidebarRail = defineComponent(
	(props: Click, { attrs, slots }) => {
		const sidebar = useSidebar();
		const { forwardRef } = useForwardExpose();
		return () =>
			h(
				Primitive,
				{
					as: "button",
					type: "button",
					tabindex: -1,
					"aria-label": "切换侧边栏",
					title: "切换侧边栏",
					...attrs,
					ref: forwardRef,
					"data-slot": "sidebar-rail",
					"data-sidebar": "rail",
					class: cn(
						"cn-sidebar-rail absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-end-2 group-data-[side=right]:-start-2 after:absolute after:inset-y-0 after:start-1/2 after:w-0.5 in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize motion-reduce:transition-none sm:flex",
						attrs.class as HTMLAttributes["class"]
					),
					onClick: (event: MouseEvent) => {
						props.onClick?.(event);
						if (!event.defaultPrevented) sidebar.toggle(event.currentTarget as HTMLElement);
					},
				},
				slots
			);
	},
	{ name: "SidebarRail", props: ["onClick"], inheritAttrs: false }
);

const MenuAction = sidebarPart(
	"button",
	"menu-action",
	"cn-sidebar-menu-action flex items-center justify-center outline-hidden group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0"
);
export const SidebarMenuAction = defineComponent(
	(props: PartProps & { showOnHover?: boolean }, { attrs, slots }) => {
		const { forwardRef } = useForwardExpose();
		return () =>
			h(
				MenuAction,
				{
					...attrs,
					ref: forwardRef,
					class: cn(
						props.showOnHover &&
							"group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 md:opacity-0",
						attrs.class as HTMLAttributes["class"]
					),
				},
				slots
			);
	},
	{ name: "SidebarMenuAction", props: { showOnHover: Boolean }, inheritAttrs: false }
);

const MenuSubButton = sidebarPart(
	"a",
	"menu-sub-button",
	"cn-sidebar-menu-sub-button flex min-w-0 items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0"
);
export const SidebarMenuSubButton = defineComponent(
	(props: PartProps & { size?: "sm" | "md"; isActive?: boolean }, { attrs, slots }) => {
		const { forwardRef } = useForwardExpose();
		return () =>
			h(
				MenuSubButton,
				{
					...attrs,
					ref: forwardRef,
					"data-size": props.size ?? "md",
					"data-active": props.isActive,
				},
				slots
			);
	},
	{
		name: "SidebarMenuSubButton",
		props: { size: String as PropType<"sm" | "md">, isActive: Boolean },
		inheritAttrs: false,
	}
);

export const SidebarMenuSkeleton = defineComponent(
	(props: { showIcon?: boolean; class?: HTMLAttributes["class"] }, { attrs, slots }) => {
		const { forwardRef } = useForwardExpose();
		return () =>
			h(
				Primitive,
				{
					...attrs,
					as: "div",
					ref: forwardRef,
					"data-slot": "sidebar-menu-skeleton",
					"data-sidebar": "menu-skeleton",
					class: cn(
						"cn-sidebar-menu-skeleton flex items-center",
						attrs.class as HTMLAttributes["class"]
					),
				},
				{
					default: () => [
						props.showIcon
							? h(Skeleton, {
									"data-sidebar": "menu-skeleton-icon",
									class: "cn-sidebar-menu-skeleton-icon",
								})
							: null,
						h(Skeleton, {
							"data-sidebar": "menu-skeleton-text",
							class: "cn-sidebar-menu-skeleton-text max-w-[70%] flex-1",
						}),
						slots.default?.(),
					],
				}
			);
	},
	{ name: "SidebarMenuSkeleton", props: { showIcon: Boolean }, inheritAttrs: false }
);
