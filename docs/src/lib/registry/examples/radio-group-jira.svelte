<script lang="ts">
	import { Label } from "$lib/registry/ui/label/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";

	const id = $props.id();
	const options = [
		{ value: "credentials", label: "Provide API credentials" },
		{ value: "csv", label: "Upload a CSV" }
	];
	let source = $state("credentials");
</script>

<RadioGroup.Root
	appearance="settings"
	aria-label="Jira data source"
	bind:value={source}
	class="max-w-xs"
>
	{#each options as option (option.value)}
		<div
			data-slot="jira-source-option"
			class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3"
		>
			<RadioGroup.Item id={`${id}-${option.value}`} value={option.value} />
			<Label for={`${id}-${option.value}`} class="min-w-0 wrap-anywhere">{option.label}</Label>
		</div>
	{/each}
</RadioGroup.Root>
