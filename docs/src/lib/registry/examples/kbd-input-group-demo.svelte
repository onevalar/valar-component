<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as Kbd from "$lib/registry/ui/kbd/index.js";

	let query = $state("");
</script>

<div class="flex w-full max-w-xs flex-col gap-6">
	<InputGroup.Root>
		<InputGroup.Input
			aria-label="Search"
			aria-keyshortcuts="Escape"
			placeholder="Search..."
			bind:value={query}
			onkeydown={(event) => {
				if (event.key === "Escape" && query) {
					event.preventDefault();
					event.stopPropagation();
					query = "";
				}
			}}
		/>
		<InputGroup.Addon>
			<SearchIcon />
		</InputGroup.Addon>
		<InputGroup.Addon align="inline-end">
			<Kbd.Root appearance="compact" aria-hidden="true">Esc</Kbd.Root>
		</InputGroup.Addon>
	</InputGroup.Root>
</div>
