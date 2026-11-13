<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Combobox } from "$lib/registry/ui/combobox/index.js";

	const options = [
		{ id: "design", label: "Design", group: "Issue labels" },
		{ id: "accessibility", label: "Accessibility", group: "Issue labels", keywords: ["a11y"] },
		{ id: "archived", label: "Archived label", group: "Issue labels", disabled: true },
		{ id: "platform", label: "Platform", group: "Team labels" },
		{ id: "docs", label: "Documentation", group: "Team labels" },
		{
			id: "review",
			label: "Needs review from a cross-functional partner before the next release",
			group: "Team labels",
		},
	];
	let value = $state<readonly string[]>(["design"]);
</script>

<Combobox
	label="Choose labels"
	placeholder="Search labels…"
	empty="No matching labels."
	{options}
	bind:value
	multiple
>
	{#snippet footer()}
		<Button variant="ghost" size="sm" disabled={!value.length} onclick={() => (value = [])}>
			Clear labels
		</Button>
	{/snippet}
</Combobox>
