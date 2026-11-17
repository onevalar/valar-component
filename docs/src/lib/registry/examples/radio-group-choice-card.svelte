<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";

	const id = $props.id();
	const plans = [
		{ value: "plus", name: "Plus", description: "For individuals and small teams." },
		{ value: "pro", name: "Pro", description: "For growing businesses." },
		{ value: "enterprise", name: "Enterprise", description: "For large teams and enterprises." }
	];
</script>

<RadioGroup.Root value="plus" aria-label="Workspace plan" class="max-w-sm">
	{#each plans as plan (plan.value)}
		{@const optionId = `${id}-${plan.value}`}
		<Field.Label for={optionId}>
			<Field.Field orientation="horizontal">
				<Field.Content>
					<Field.Title id={`${optionId}-title`}>{plan.name}</Field.Title>
					<Field.Description id={`${optionId}-desc`}>{plan.description}</Field.Description>
				</Field.Content>
				<RadioGroup.Item
					value={plan.value}
					id={optionId}
					aria-labelledby={`${optionId}-title`}
					aria-describedby={`${optionId}-desc`}
				/>
			</Field.Field>
		</Field.Label>
	{/each}
</RadioGroup.Root>
