<script lang="ts">
	import { page } from "$app/state";
	import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
	import DocsSidebar from "$lib/components/docs-sidebar.svelte";
	import type { Locale } from "$lib/i18n/config.js";
	import { getSidebarNavItems, sectionOf } from "$lib/navigation.js";
	let { children } = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const allNavItems = $derived(getSidebarNavItems(locale));
	// Component pages (basic and advanced) are browsed through cards, so they have no sidebar;
	// every other docs page keeps the sidebar, with documentation sections only.
	const inComponents = $derived(
		["components", "advanced"].includes(sectionOf(page.url.pathname, locale) ?? "")
	);
	const docsNavItems = $derived(
		allNavItems.filter((item) => item.key !== "components" && item.key !== "ai-elements")
	);
</script>

<!-- Two fixed layouts instead of one wrapper whose classes change, so switching sections never leaves stale grid classes behind. -->
<div class="container-wrapper flex flex-1 flex-col px-2">
	{#if inComponents}
		<Sidebar.Provider
			class="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:[--top-spacing:calc(var(--spacing)*4)] 3xl:fixed:container 3xl:fixed:px-3"
			style="--sidebar-width: calc(var(--spacing) * 72)"
		>
			<div class="flex h-full w-full flex-col">{@render children()}</div>
		</Sidebar.Provider>
	{:else}
		<Sidebar.Provider
			class="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)] 3xl:fixed:container 3xl:fixed:px-3"
			style="--sidebar-width: calc(var(--spacing) * 72)"
		>
			<DocsSidebar navItems={docsNavItems} />
			<div class="h-full w-full">{@render children()}</div>
		</Sidebar.Provider>
	{/if}
</div>
