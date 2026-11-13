<script lang="ts">
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import {
		SIDEBAR_COOKIE_MAX_AGE,
		SIDEBAR_COOKIE_NAME,
		SIDEBAR_WIDTH,
		SIDEBAR_WIDTH_ICON,
	} from "./constants.js";
	import { setSidebar } from "./context.svelte.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		open = $bindable(true),
		onOpenChange = () => {},
		persistState = true,
		keyboardShortcut = true,
		appearance = "default",
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/** Disable cookie writes for temporary or embedded application shells. */
		persistState?: boolean;
		/** Enable Cmd/Ctrl+B outside editable elements. Defaults to true. */
		keyboardShortcut?: boolean;
		/** Apply the workspace navigation appearance to this Sidebar. */
		appearance?: "default" | "workspace";
	} = $props();

	const expandedWidth = $derived(appearance === "workspace" ? "192px" : SIDEBAR_WIDTH);
	const sidebar = setSidebar({
		open: () => open,
		keyboardShortcut: () => keyboardShortcut,
		appearance: () => appearance,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);

			// This sets the cookie to keep the sidebar state.
			if (persistState) {
				document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
			}
		},
	});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<Tooltip.Provider delayDuration={0}>
	<div
		data-slot="sidebar-wrapper"
		data-appearance={appearance}
		style="--sidebar-width: var(--sidebar-width-default, {expandedWidth}); --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
		class={cn(
			"group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
			"cn-sidebar-provider",
			appearance === "workspace" && "cn-sidebar-workspace bg-sidebar",
			className
		)}
		bind:this={ref}
		{...restProps}
	>
		{@render children?.()}
	</div>
</Tooltip.Provider>
