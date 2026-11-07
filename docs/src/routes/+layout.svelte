<script lang="ts">
	import "../app.css";
	import { useScrollbarAutohide } from "$lib/registry/hooks/use-scrollbar-autohide.svelte.js";

	let { children } = $props();

	useScrollbarAutohide();
</script>

{@render children()}
