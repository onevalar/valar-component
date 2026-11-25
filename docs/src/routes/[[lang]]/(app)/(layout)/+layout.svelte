<script lang="ts">
	import { afterNavigate } from "$app/navigation";
	import { onMount } from "svelte";
	import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import SiteHeader from "$lib/components/site-header.svelte";
	import { syncMenuColor } from "$lib/features/design-system/index.js";
	import { DEFAULT_CONFIG } from "$lib/registry/config.js";

	let { children } = $props();
	let scrollViewport = $state<HTMLElement | null>(null);

	// The design system provider only runs on /create and /preview, so apply the default menu
	// color here. Otherwise menus keep `cn-menu-translucent`, which overrides destructive items.
	onMount(() => syncMenuColor(DEFAULT_CONFIG.menuColor));

	afterNavigate(({ to, from }) => {
		if (!scrollViewport) return;
		if (to?.url.pathname === from?.url.pathname) return;
		const hash = to?.url.hash;
		if (hash) {
			const target = document.getElementById(decodeURIComponent(hash.slice(1)));
			if (target) {
				target.scrollIntoView();
				return;
			}
		}
		scrollViewport.scrollTop = 0;
	});
</script>

<div
	data-slot="layout"
	class="group/layout relative z-10 flex h-svh flex-col overflow-hidden bg-background"
>
	<SiteHeader />
	<ScrollArea
		bind:viewportRef={scrollViewport}
		appearance="settings"
		orientation="vertical"
		class="min-h-0 flex-1 [&_[data-scroll-area-content]]:flex [&_[data-scroll-area-content]]:min-h-full [&_[data-scroll-area-content]]:shrink-0 [&_[data-scroll-area-content]]:flex-col"
		scrollbarYClasses="z-40"
	>
		<main class="flex flex-1 flex-col">
			<Tooltip.Provider>
				{@render children()}
			</Tooltip.Provider>
		</main>
	</ScrollArea>
</div>
