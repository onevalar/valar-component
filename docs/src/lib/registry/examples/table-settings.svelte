<script lang="ts">
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import {
		createColumnHelper,
		createSortedRowModel,
		createTable,
		rowSelectionFeature,
		rowSortingFeature,
		sortFn_text,
		tableFeatures,
	} from "@tanstack/svelte-table";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as Table from "$lib/registry/ui/table/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const labels = [
		{ name: "Bug", description: "An unexpected behavior", color: "#eb5757" },
		{ name: "Feature", description: "A new capability", color: "#8a7bdf" },
		{
			name: "Improvement",
			description: "A change to existing behavior",
			color: "#3b9f70",
		},
	];
	let query = $state("");
	const matchingLabels = $derived(
		labels.filter((label) => label.name.toLowerCase().includes(query.trim().toLowerCase()))
	);
	const features = tableFeatures({
		rowSelectionFeature,
		rowSortingFeature,
		sortedRowModel: createSortedRowModel(),
		sortFns: { text: sortFn_text },
	});
	const columnHelper = createColumnHelper<typeof features, (typeof labels)[number]>();
	const columns = columnHelper.columns([columnHelper.accessor("name", { sortFn: "text" })]);
	const table = createTable({
		features,
		columns,
		get data() {
			return matchingLabels;
		},
		getRowId: (label) => label.name,
		initialState: { sorting: [{ id: "name", desc: false }] },
	});
	const nameColumn = $derived(table.getColumn("name")!);
	const descending = $derived(nameColumn.getIsSorted() === "desc");
</script>

<div class="grid w-full min-w-0 gap-3">
	<Input
		type="search"
		aria-label="Filter labels"
		placeholder="Filter by name…"
		bind:value={query}
	/>
	<Table.Root appearance="settings" scrollLabel="Label columns" class="min-w-[28rem]">
		<Table.Caption class="sr-only">Issue labels</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head scope="col" class="w-10">
					<Checkbox
						checked={table.getIsAllRowsSelected()}
						indeterminate={table.getIsSomeRowsSelected()}
						onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
						aria-label="Select all labels"
					/>
				</Table.Head>
				<Table.Head scope="col" aria-sort={descending ? "descending" : "ascending"}>
					<button
						type="button"
						class="inline-flex h-6 items-center gap-0.5 rounded-full px-1.5 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
						onclick={() => nameColumn.toggleSorting(!descending)}
					>
						Name
						{#if descending}
							<ArrowDownIcon class="size-3" aria-hidden="true" />
						{:else}
							<ArrowUpIcon class="size-3" aria-hidden="true" />
						{/if}
					</button>
				</Table.Head>
				<Table.Head scope="col">Description</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() ? "selected" : undefined}>
					<Table.Cell>
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(checked) => row.toggleSelected(checked)}
							aria-label={`Select ${row.original.name}`}
						/>
					</Table.Cell>
					<Table.Cell class="font-medium">
						<span class="inline-flex items-center gap-2">
							<span
								class="size-2 rounded-full"
								style:background-color={row.original.color}
								aria-hidden="true"
							></span>
							{row.original.name}
						</span>
					</Table.Cell>
					<Table.Cell>{row.original.description}</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={3} class="whitespace-normal">
						<Empty.Root class="min-h-20 items-start p-3 text-start">
							<Empty.Title>No matching labels</Empty.Title>
						</Empty.Root>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
