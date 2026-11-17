<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	const id = $props.id();
	const options = [
		{ value: "email", label: "Email only" },
		{ value: "sms", label: "SMS only" },
		{ value: "both", label: "Both Email & SMS" }
	];
</script>

<Field.Set class="w-full max-w-xs">
	<Field.Legend variant="label" id={`${id}-legend`}>Notification Preferences</Field.Legend>
	<Field.Description id={`${id}-desc`}
		>Choose how you want to receive notifications.</Field.Description
	>
	<RadioGroup.Root
		value="email"
		aria-labelledby={`${id}-legend`}
		aria-describedby={`${id}-desc ${id}-error`}
		aria-invalid
	>
		{#each options as option (option.value)}
			{@const optionId = `${id}-${option.value}`}
			<Field.Field orientation="horizontal" data-invalid>
				<RadioGroup.Item
					value={option.value}
					id={optionId}
					aria-invalid
					aria-describedby={`${id}-error`}
				/>
				<Field.Label for={optionId} class="font-normal">{option.label}</Field.Label>
			</Field.Field>
		{/each}
	</RadioGroup.Root>
	<Field.Error id={`${id}-error`}>The selected notification method is unavailable.</Field.Error>
</Field.Set>
