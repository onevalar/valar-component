<script lang="ts">
	import { onDestroy } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";

	let state = $state<"idle" | "pending" | "ready">("idle");
	let timer: ReturnType<typeof setTimeout> | undefined;

	function synchronize() {
		if (state === "pending") return;
		state = "pending";
		timer = setTimeout(() => {
			state = "ready";
			timer = undefined;
		}, 2200);
	}

	onDestroy(() => clearTimeout(timer));
</script>

<section aria-label="Sync indicator example" class="grid w-full min-w-0 max-w-xs grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
	<Button size="sm" variant="outline" aria-disabled={state === "pending"} onclick={synchronize}>
		Sync changes
	</Button>
	<div role="status" class="flex h-6 min-w-0 items-center text-xs font-medium">
		{#if state === "pending"}
			<Spinner appearance="dots" label="Syncing" role="none" />
		{:else if state === "ready"}
			<span>Synced</span>
		{:else}
			<span class="text-muted-foreground">Ready to sync</span>
		{/if}
	</div>
</section>
