<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children,
	}: {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
		children?: Snippet;
	} = $props();
</script>

{@render children?.()}
