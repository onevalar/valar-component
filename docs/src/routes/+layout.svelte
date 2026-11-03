<script lang="ts">
	import { page } from "$app/state";
	import TailwindIndicator from "$lib/components/tailwind-indicator.svelte";
	import "../app.css";

	let { children } = $props();
</script>

{#if page.route.id !== "/sidebar-preview" && page.route.id !== "/sonner-preview"}
	<TailwindIndicator />
{/if}
{@render children()}
