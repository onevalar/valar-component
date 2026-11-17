<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	const id = $props.id();
</script>

<RadioGroup.Root value="comfortable" aria-label="Spacing presets" class="w-fit">
	<Field.Field orientation="horizontal">
		<RadioGroup.Item value="default" id={`${id}-default`} aria-describedby={`${id}-default-desc`} />
		<Field.Content>
			<Field.Label for={`${id}-default`}>Default</Field.Label>
			<Field.Description id={`${id}-default-desc`}
				>Standard spacing for most use cases.</Field.Description
			>
		</Field.Content>
	</Field.Field>
	<Field.Field orientation="horizontal">
		<RadioGroup.Item
			value="comfortable"
			id={`${id}-comfortable`}
			aria-describedby={`${id}-comfortable-desc`}
		/>
		<Field.Content>
			<Field.Label for={`${id}-comfortable`}>Comfortable</Field.Label>
			<Field.Description id={`${id}-comfortable-desc`}
				>More space between elements.</Field.Description
			>
		</Field.Content>
	</Field.Field>
	<Field.Field orientation="horizontal">
		<RadioGroup.Item value="compact" id={`${id}-compact`} aria-describedby={`${id}-compact-desc`} />
		<Field.Content>
			<Field.Label for={`${id}-compact`}>Compact</Field.Label>
			<Field.Description id={`${id}-compact-desc`}
				>Minimal spacing for dense layouts.</Field.Description
			>
		</Field.Content>
	</Field.Field>
</RadioGroup.Root>
