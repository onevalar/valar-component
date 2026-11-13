<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
	let query = $state("");
	let result = $state("");
</script>

<form
	class="grid w-full max-w-xs gap-2"
	onsubmit={(event) => {
		event.preventDefault();
		result = query.trim();
	}}
>
	<Field.Label for={id}>Search issues</Field.Label>
	<Field.Field orientation="horizontal">
		<Input {id} type="search" bind:value={query} placeholder="Search..." />
		<Button type="submit" disabled={!query.trim()}>Search</Button>
	</Field.Field>
	{#if result}<p role="status" class="text-muted-foreground text-xs [overflow-wrap:anywhere]">
			Search query: {result}
		</p>{/if}
</form>
