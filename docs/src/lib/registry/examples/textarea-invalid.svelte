<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const id = $props.id();
	let message = $state("");
	const invalid = $derived(message.trim().length === 0);
</script>

<Field.Field data-invalid={invalid || undefined}>
	<Field.Label for={id}>Message</Field.Label>
	<Textarea
		{id}
		bind:value={message}
		required
		placeholder="Type your message here."
		aria-invalid={invalid || undefined}
		aria-describedby={invalid ? `${id}-error` : undefined}
	/>
	{#if invalid}
		<Field.Error id={`${id}-error`}>Enter a message.</Field.Error>
	{/if}
</Field.Field>
