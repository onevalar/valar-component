<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	const id = $props.id();
</script>

<RadioGroup.Root value="option2" aria-label="Available options" class="w-fit">
	<Field.Field orientation="horizontal" data-disabled>
		<RadioGroup.Item value="option1" id={`${id}-1`} disabled />
		<Field.Label for={`${id}-1`} class="font-normal">Disabled</Field.Label>
	</Field.Field>
	<Field.Field orientation="horizontal">
		<RadioGroup.Item value="option2" id={`${id}-2`} />
		<Field.Label for={`${id}-2`} class="font-normal">Option 2</Field.Label>
	</Field.Field>
	<Field.Field orientation="horizontal">
		<RadioGroup.Item value="option3" id={`${id}-3`} />
		<Field.Label for={`${id}-3`} class="font-normal">Option 3</Field.Label>
	</Field.Field>
</RadioGroup.Root>
