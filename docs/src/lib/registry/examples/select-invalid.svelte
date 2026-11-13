<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";

	const fruits = [
		{ value: "apple", label: "Apple" },
		{ value: "banana", label: "Banana" },
		{ value: "blueberry", label: "Blueberry" },
	];

	const id = $props.id();
	let value = $state("");
	const invalid = $derived(!value);
</script>

<Field.Field data-invalid={invalid || undefined} class="w-full max-w-48">
	<Field.Label for={id} required>Required fruit</Field.Label>
	<Select.Root type="single" items={fruits} bind:value required name="requiredFruit">
		<Select.Trigger
			{id}
			aria-invalid={invalid}
			aria-required="true"
			aria-describedby={invalid ? `${id}-error` : undefined}
		>
			<Select.Value placeholder="Select a fruit" />
		</Select.Trigger>
		<Select.Content aria-label="Required fruit options">
			<Select.Group>
				{#each fruits as fruit (fruit.value)}
					<Select.Item value={fruit.value} label={fruit.label}>{fruit.label}</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
	{#if invalid}
		<Field.Error id={`${id}-error`}>Please select a fruit.</Field.Error>
	{/if}
</Field.Field>
