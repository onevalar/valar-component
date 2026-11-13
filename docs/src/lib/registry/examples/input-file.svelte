<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
	let files = $state<FileList>();
</script>

<Field.Field class="max-w-xs">
	<Field.Label for={id}>Picture</Field.Label>
	<Input {id} type="file" accept="image/*" aria-describedby={`${id}-description`} bind:files />
	<Field.Description id={`${id}-description`}
		>Choose a picture to preview file selection.</Field.Description
	>
	{#if files?.length}
		<p role="status" class="text-muted-foreground text-xs [overflow-wrap:anywhere]">
			Selected {files[0].name}
		</p>
	{/if}
</Field.Field>
