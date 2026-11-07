<script lang="ts">
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
	import ComponentPreviewTabs from "./component-preview-tabs.svelte";
	import type { Component } from "svelte";

	/**
	 * One state of a component as the docs show it: the live example, the "tune" editor where the
	 * component has one, and the code on demand.
	 */
	let { name }: { name: string } = $props();

	const modules = import.meta.glob<{ default: Component }>("/src/lib/registry/examples/*.svelte");
	const loader = $derived(modules[`/src/lib/registry/examples/${name}.svelte`]);
</script>

{#if loader}
	{#await loader()}
		<Skeleton class="h-48 rounded-xl" />
	{:then module}
		<ComponentPreviewTabs {name} component={module.default} hideCode bare />
	{/await}
{:else}
	<p class="text-sm text-muted-foreground">无预览</p>
{/if}
