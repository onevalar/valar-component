<script lang="ts">
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const CURRENCIES = [
		{
			value: "$",
			label: "US Dollar",
		},
		{
			value: "€",
			label: "Euro",
		},
		{
			value: "£",
			label: "British Pound",
		},
	];

	let currency = $state("$");
</script>

<ButtonGroup.Root aria-label="Payment actions">
	<ButtonGroup.Root aria-label="Payment amount">
		<Select.Root type="single" bind:value={currency}>
			<Select.Trigger aria-label="Currency" class="font-mono">
				{currency}
			</Select.Trigger>
			<Select.Content align="start">
				<Select.Group>
					{#each CURRENCIES as currencyOption (currencyOption.value)}
						<Select.Item value={currencyOption.value}>
							{currencyOption.value}
							<span class="text-muted-foreground">{currencyOption.label}</span>
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Input aria-label="Amount" placeholder="10.00" inputmode="decimal" />
	</ButtonGroup.Root>
	<ButtonGroup.Root>
		<Button aria-label="Send" size="icon" variant="outline">
			<ArrowRight />
		</Button>
	</ButtonGroup.Root>
</ButtonGroup.Root>
