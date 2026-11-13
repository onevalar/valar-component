<script lang="ts">
	import { SvelteSet } from "svelte/reactivity";
	import * as Table from "$lib/registry/ui/table/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

	const tableData = [
		{ id: "1", name: "Sarah Chen", email: "sarah.chen@example.com", role: "Admin" },
		{ id: "2", name: "Marcus Rodriguez", email: "marcus.rodriguez@example.com", role: "User" },
		{ id: "3", name: "Priya Patel", email: "priya.patel@example.com", role: "User" },
		{ id: "4", name: "David Kim", email: "david.kim@example.com", role: "Editor" },
	];

	const selectedRows = new SvelteSet<string>(["1"]);
	const selectAll = $derived(selectedRows.size === tableData.length);
	const someSelected = $derived(selectedRows.size > 0 && !selectAll);
	const id = $props.id();

	function handleSelectAll(checked: boolean) {
		if (checked) {
			for (const row of tableData) selectedRows.add(row.id);
		} else {
			selectedRows.clear();
		}
	}

	function handleSelectRow(id: string, checked: boolean) {
		if (checked) {
			selectedRows.add(id);
		} else {
			selectedRows.delete(id);
		}
	}
</script>

<div class="w-full min-w-0 space-y-2">
	<p role="status" class="text-xs text-muted-foreground">{selectedRows.size} selected</p>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-8">
					<Checkbox
						id="{id}-select-all"
						name="select-all-checkbox"
						aria-label="Select all users"
						checked={selectAll}
						indeterminate={someSelected}
						onCheckedChange={handleSelectAll}
					/>
				</Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head>Email</Table.Head>
				<Table.Head>Role</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each tableData as row (row.id)}
				<Table.Row data-state={selectedRows.has(row.id) ? "selected" : undefined}>
					<Table.Cell>
						<Checkbox
							id="{id}-row-{row.id}"
							name="row-{row.id}-checkbox"
							aria-label={`Select ${row.name}`}
							checked={selectedRows.has(row.id)}
							onCheckedChange={(checked) => handleSelectRow(row.id, checked === true)}
						/>
					</Table.Cell>
					<Table.Cell class="font-medium">{row.name}</Table.Cell>
					<Table.Cell>{row.email}</Table.Cell>
					<Table.Cell>{row.role}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
