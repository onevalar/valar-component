<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

	const id = $props.id();
	let checked = $state(false);
	let attempted = $state(false);
	let submitted = $state(false);
	let checkbox = $state<HTMLButtonElement | null>(null);
	const invalid = $derived(attempted && !checked);
</script>

<form
	class="w-full max-w-xs"
	novalidate
	onsubmit={(event) => {
		event.preventDefault();
		attempted = true;
		submitted = new FormData(event.currentTarget).get("terms") === "accepted";
		if (!submitted) checkbox?.focus();
	}}
>
	<Field.Group class="gap-3">
		<Field.Field orientation="horizontal" data-invalid={invalid || undefined}>
			<Checkbox
				{id}
				bind:ref={checkbox}
				bind:checked
				name="terms"
				value="accepted"
				required
				aria-invalid={invalid || undefined}
				aria-describedby={invalid ? `${id}-error` : undefined}
			/>
			<Field.Content>
				<Field.Label for={id}>Accept terms and conditions</Field.Label>
				{#if invalid}
					<Field.Error id={`${id}-error`}>Accept the terms to continue.</Field.Error>
				{/if}
			</Field.Content>
		</Field.Field>
		<Button type="submit" class="w-fit">Continue</Button>
		{#if submitted}<p role="status" class="text-sm">Preferences submitted.</p>{/if}
	</Field.Group>
</form>
