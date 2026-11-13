<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";

	const id = $props.id();
	const options = [
		{ value: "default", label: "Default" },
		{ value: "small", label: "Small" },
		{ value: "large", label: "Large" },
	];
	let value = $state("default");
</script>

<Field.Group class="max-w-xl">
	<Field.Field orientation="responsive" appearance="settings" class="rounded-lg border">
		<Field.Content>
			<Field.Label for={id}>Font size</Field.Label>
			<Field.Description id={`${id}-description`}
				>Adjust the size of text across the app.</Field.Description
			>
		</Field.Content>
		<Select.Root type="single" items={options} bind:value>
			<Select.Trigger size="settings" {id} aria-describedby={`${id}-description`}>
				<Select.Value />
			</Select.Trigger>
			<Select.Content appearance="settings" align="end" aria-label="Font sizes">
				{#each options as option (option.value)}
					<Select.Item {...option} />
				{/each}
			</Select.Content>
		</Select.Root>
	</Field.Field>
</Field.Group>
