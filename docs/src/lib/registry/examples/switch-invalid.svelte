<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	const id = $props.id();
	let checked = $state(false);
</script>

<Field.Field orientation="horizontal" class="max-w-sm" data-invalid={!checked || undefined}>
	<Field.Content>
		<Field.Label for={id}>Secure sign-in</Field.Label>
		{#if !checked}
			<Field.Error id={`${id}-error`}>Secure sign-in is required for this workspace.</Field.Error>
		{/if}
	</Field.Content>
	<Switch
		{id}
		bind:checked
		aria-invalid={!checked}
		aria-describedby={!checked ? `${id}-error` : undefined}
		required
	/>
</Field.Field>
