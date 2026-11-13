<script lang="ts">
	import { Combobox } from "$lib/registry/ui/combobox/index.js";

	const errorId = $props.id();
	const options = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"].map((label) => ({
		id: label,
		label,
	}));
	let value = $state<readonly string[]>([]);
</script>

<div class="grid justify-items-start gap-1.5">
	<Combobox
		label="Required framework"
		placeholder="Search required framework…"
		empty="No matching frameworks."
		{options}
		bind:value
		triggerProps={{
			"aria-invalid": value.length === 0,
			"aria-describedby": value.length === 0 ? errorId : undefined,
		}}
	/>
	{#if value.length === 0}
		<p id={errorId} class="text-xs text-destructive">Choose a framework to continue.</p>
	{/if}
</div>
