<script lang="ts">
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
	import { cn } from "$lib/utils.js";
	import type { Component } from "svelte";

	/**
	 * A live copy of one registry example. It loads only once it scrolls into view, so a page of
	 * dozens of cards stays light, and it is inert: it is a picture of the component, not a control.
	 */
	let {
		name,
		zoom = 1,
		interactive = false,
		class: className,
	}: { name: string; zoom?: number; interactive?: boolean; class?: string } = $props();

	const modules = import.meta.glob<{ default: Component }>("/src/lib/registry/examples/*.svelte");

	let host = $state<HTMLElement | null>(null);
	let visible = $state(false);
	let failed = $state(false);

	$effect(() => {
		if (!host) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					visible = true;
					observer.disconnect();
				}
			},
			{ rootMargin: "200px" }
		);
		observer.observe(host);
		return () => observer.disconnect();
	});

	const loader = $derived(modules[`/src/lib/registry/examples/${name}.svelte`]);
	const loaded = $derived(visible && loader ? loader() : null);
</script>

<div
	bind:this={host}
	class={cn("flex size-full min-h-0 items-center justify-center overflow-hidden", className)}
	inert={!interactive}
	aria-hidden={interactive ? undefined : "true"}
>
	{#if !loader || failed}
		<span class="text-xs text-muted-foreground">无预览</span>
	{:else if loaded}
		{#await loaded}
			<Skeleton class="size-3/4" />
		{:then module}
			{@const Demo = module.default}
			<svelte:boundary onerror={() => (failed = true)}>
				<div style:zoom style:width="{100 / zoom}%" class="flex items-center justify-center">
					<Demo />
				</div>
			</svelte:boundary>
		{:catch}
			<span class="text-xs text-muted-foreground">无预览</span>
		{/await}
	{:else}
		<Skeleton class="size-3/4" />
	{/if}
</div>
