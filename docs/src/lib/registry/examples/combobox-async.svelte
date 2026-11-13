<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Combobox, type ComboboxOption } from "$lib/registry/ui/combobox/index.js";

	const projects = [
		{ id: "portal", label: "Customer Portal" },
		{ id: "design", label: "Design Systems" },
		{ id: "support", label: "Support Tools" },
	];
	let query = $state("");
	let open = $state(false);
	let retry = $state(0);
	let loading = $state(false);
	let error = $state("");
	let options = $state<ComboboxOption[]>(projects);
	let value = $state<readonly string[]>([]);
	const selected = $derived(projects.find((project) => project.id === value[0]));

	$effect(() => {
		if (!open) return;
		const text = query.trim().toLowerCase();
		const attempt = retry;
		loading = true;
		error = "";
		const timer = setTimeout(() => {
			if (text === "support" && attempt === 0) {
				error = "Could not load projects.";
			} else {
				options = projects.filter((project) => project.label.toLowerCase().includes(text));
			}
			loading = false;
		}, 350);
		return () => clearTimeout(timer);
	});
</script>

<Combobox
	label="Find project"
	placeholder="Search projects…"
	empty="No matching projects."
	loadingLabel="Looking up projects…"
	{options}
	{loading}
	{error}
	bind:query
	bind:open
	bind:value
	filter={false}
	triggerProps={{ "aria-label": selected ? `Find project: ${selected.label}` : "Find project" }}
>
	{#snippet children()}
		{selected?.label ?? "Find project"}
	{/snippet}
	{#snippet footer()}
		{#if error}
			<Button variant="ghost" size="sm" onclick={() => (retry += 1)}>Retry lookup</Button>
		{/if}
	{/snippet}
</Combobox>
