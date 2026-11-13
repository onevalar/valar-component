<script lang="ts">
	import * as Select from "$lib/registry/ui/select/index.js";

	const fruits = [
		{ value: "apple", label: "Apple" },
		{ value: "banana", label: "Banana" },
		{ value: "blueberry", label: "Blueberry" },
		{ value: "grapes", label: "Grapes", disabled: true },
		{ value: "pineapple", label: "Pineapple" },
	];

	const id = $props.id();
	let value = $state("");
</script>

<div class="flex w-full max-w-48 flex-col gap-3">
	<Select.Root type="single" items={fruits} value="apple" disabled>
		<Select.Trigger class="w-full" aria-label="Locked fruit" aria-describedby={id}>
			<Select.Value />
		</Select.Trigger>
	</Select.Root>
	<p {id} class="text-xs text-muted-foreground">Managed by your workspace.</p>
	<Select.Root type="single" items={fruits} bind:value>
		<Select.Trigger class="w-full" aria-label="Available fruit">
			<Select.Value placeholder="Select a fruit" />
		</Select.Trigger>
		<Select.Content aria-label="Available fruit options">
			{#each fruits as fruit (fruit.value)}
				<Select.Item value={fruit.value} label={fruit.label} disabled={fruit.disabled}>
					{fruit.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
