<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import XIcon from "@lucide/svelte/icons/x";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";

	const settings = ["Profile", "Preferences", "Notifications"];
	const resultsId = $props.id();
	let query = $state("");
	let input = $state<HTMLInputElement | null>(null);
	const matches = $derived(
		settings.filter((setting) => setting.toLowerCase().includes(query.trim().toLowerCase()))
	);

	function clear() {
		query = "";
		input?.focus();
	}
</script>

<div class="w-full max-w-[168px] space-y-2">
	<InputGroup.Root appearance="settings-search">
		<InputGroup.Input
			bind:ref={input}
			bind:value={query}
			type="search"
			aria-label="Search settings"
			aria-controls={resultsId}
			placeholder="Search..."
			onkeydown={(event) => {
				if (event.key === "Escape" && query) {
					event.preventDefault();
					event.stopPropagation();
					clear();
				}
			}}
		/>
		<InputGroup.Addon aria-hidden="true"><SearchIcon /></InputGroup.Addon>
		<InputGroup.Addon align="inline-end">
			{#if query}
				<InputGroup.Button
					size="icon-xs"
					aria-label="Clear search"
					onclick={clear}
				>
					<XIcon class="size-3" />
				</InputGroup.Button>
			{/if}
		</InputGroup.Addon>
	</InputGroup.Root>
	<div id={resultsId} class="text-xs text-muted-foreground" aria-live="polite">
		{#if matches.length}
			<ul class="grid gap-1">
				{#each matches as setting (setting)}
					<li>{setting}</li>
				{/each}
			</ul>
		{:else}
			<p>No matching settings</p>
		{/if}
	</div>
</div>
