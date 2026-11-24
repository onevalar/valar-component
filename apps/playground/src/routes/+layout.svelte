<script lang="ts">
	import "../app.css";
	import { Toaster } from "@valar/svelte-ui/sonner";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
<Toaster />
