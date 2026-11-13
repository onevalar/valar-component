<script lang="ts">
	import * as Sheet from "$lib/registry/ui/sheet/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { SIDEBAR_WIDTH_MOBILE } from "./constants.js";
	import { useSidebar } from "./context.svelte.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		side = "left",
		variant = "sidebar",
		collapsible = "offcanvas",
		class: className,
		children,
		id,
		mobileTitle = "侧边栏",
		mobileCloseButton = true,
		mobileDescription = "显示移动端侧边栏。",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		side?: "left" | "right";
		variant?: "sidebar" | "floating" | "inset";
		collapsible?: "offcanvas" | "icon" | "none";
		/** Screen reader title and description of the mobile sheet. */
		mobileTitle?: string;
		/** Set false when the mobile header supplies its own close button. */
		mobileCloseButton?: boolean;
		mobileDescription?: string;
	} = $props();

	const sidebar = useSidebar();
</script>

{#if collapsible === "none"}
	<div
		data-slot="sidebar"
		data-sidebar="sidebar"
		class={cn(
			"flex h-full w-(--sidebar-width) max-w-full flex-col bg-sidebar text-sidebar-foreground",
			className
		)}
		bind:this={ref}
		{id}
		{...restProps}
	>
		{@render children?.()}
	</div>
{:else if sidebar.isMobile}
	<Sheet.Root bind:open={() => sidebar.openMobile, (v) => sidebar.setOpenMobile(v)} {...restProps}>
		<Sheet.Content
			bind:ref
			id={id ?? undefined}
			data-sidebar="sidebar"
			data-slot="sidebar"
			data-mobile="true"
			class={cn(
				"w-(--sidebar-width) max-w-full bg-sidebar p-0 text-sidebar-foreground",
				sidebar.appearance === "workspace" && "cn-sidebar-workspace",
				className
			)}
			style="--sidebar-width: {SIDEBAR_WIDTH_MOBILE};"
			{side}
			showCloseButton={mobileCloseButton}
			onCloseAutoFocus={(event) => {
				const opener = sidebar.mobileOpener;
				sidebar.mobileOpener = null;
				if (!opener?.isConnected) return;
				event.preventDefault();
				opener.focus();
			}}
		>
			<Sheet.Header class="sr-only">
				<Sheet.Title>{mobileTitle}</Sheet.Title>
				<Sheet.Description>{mobileDescription}</Sheet.Description>
			</Sheet.Header>
			<div class="flex h-full w-full flex-col">
				{@render children?.()}
			</div>
		</Sheet.Content>
	</Sheet.Root>
{:else}
	<div
		bind:this={ref}
		{id}
		class="group peer hidden text-sidebar-foreground md:block"
		data-state={sidebar.state}
		data-collapsible={sidebar.state === "collapsed" ? collapsible : ""}
		data-variant={variant}
		data-side={side}
		data-slot="sidebar"
	>
		<!-- This is what handles the sidebar gap on desktop -->
		<div
			data-slot="sidebar-gap"
			class={cn(
				"cn-sidebar-gap relative w-(--sidebar-width) bg-transparent",
				"group-data-[collapsible=offcanvas]:w-0",
				"group-data-[side=right]:rotate-180",
				variant === "floating" || variant === "inset"
					? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
					: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
			)}
		></div>
		<div
			data-slot="sidebar-container"
			data-side={side}
			inert={collapsible === "offcanvas" && !sidebar.open}
			class={cn(
				"fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:start-0 data-[side=left]:group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)] data-[side=right]:end-0 data-[side=right]:group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)] md:flex",
				// Adjust the padding for floating and inset variants.
				variant === "floating" || variant === "inset"
					? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
					: [
							"group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
							sidebar.appearance === "default" &&
								"group-data-[side=left]:border-e group-data-[side=right]:border-s",
						],
				className
			)}
			{...restProps}
		>
			<div
				data-sidebar="sidebar"
				data-slot="sidebar-inner"
				class="cn-sidebar-inner flex size-full flex-col"
			>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
