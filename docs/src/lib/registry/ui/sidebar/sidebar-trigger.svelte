<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import { useSidebar } from "./context.svelte.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		label = "切换侧边栏",
		...restProps
	}: ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
		/** Screen reader text. */
		label?: string;
	} = $props();

	const sidebar = useSidebar();
	const expanded = $derived(sidebar.isMobile ? sidebar.openMobile : sidebar.open);
</script>

<Button
	bind:ref
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	variant="ghost"
	size="icon-sm"
	class={cn("cn-sidebar-trigger", className)}
	type="button"
	aria-expanded={sidebar.appearance === "workspace" ? expanded : undefined}
	onclick={(e) => {
		onclick?.(e);
		if (e.defaultPrevented) return;
		if (sidebar.isMobile && !sidebar.openMobile) sidebar.mobileOpener = e.currentTarget;
		sidebar.toggle();
	}}
	{...restProps}
>
	<IconPlaceholder
		lucide="PanelLeftIcon"
		tabler="IconLayoutSidebar"
		hugeicons="SidebarLeftIcon"
		phosphor="SidebarIcon"
		remixicon="RiSideBarLine"
		class="cn-rtl-flip"
	/>
	<span class="sr-only">{label}</span>
</Button>
