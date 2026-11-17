<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	const id = $props.id();
</script>

<Field.Set class="w-full max-w-xs">
	<Field.Legend variant="label" id={`${id}-legend`}>Subscription Plan</Field.Legend>
	<Field.Description id={`${id}-desc`}
		>Yearly and lifetime plans offer significant savings.</Field.Description
	>
	<RadioGroup.Root value="monthly" aria-labelledby={`${id}-legend`} aria-describedby={`${id}-desc`}>
		<Field.Field orientation="horizontal">
			<RadioGroup.Item value="monthly" id={`${id}-monthly`} />
			<Field.Label for={`${id}-monthly`} class="font-normal">Monthly ($9.99/month)</Field.Label>
		</Field.Field>
		<Field.Field orientation="horizontal">
			<RadioGroup.Item value="yearly" id={`${id}-yearly`} />
			<Field.Label for={`${id}-yearly`} class="font-normal">Yearly ($99.99/year)</Field.Label>
		</Field.Field>
		<Field.Field orientation="horizontal">
			<RadioGroup.Item value="lifetime" id={`${id}-lifetime`} />
			<Field.Label for={`${id}-lifetime`} class="font-normal">Lifetime ($299.99)</Field.Label>
		</Field.Field>
	</RadioGroup.Root>
</Field.Set>
