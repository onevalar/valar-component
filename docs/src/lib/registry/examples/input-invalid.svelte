<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
	let email = $state("jordan@");
	let invalid = $state(true);
</script>

<Field.Field data-invalid={invalid || undefined} class="max-w-xs">
	<Field.Label for={id}>Work email</Field.Label>
	<Input
		{id}
		type="email"
		autocomplete="email"
		required
		bind:value={email}
		aria-invalid={invalid || undefined}
		aria-describedby={invalid ? `${id}-error` : undefined}
		oninput={({ currentTarget }) => (invalid = !currentTarget.validity.valid)}
	/>
	{#if invalid}
		<Field.Error id={`${id}-error`}>Enter a valid email address.</Field.Error>
	{/if}
</Field.Field>
