<script setup lang="ts">
import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createColumnHelper,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFn_includesString,
	FlexRender,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/vue-table";
import { Button } from "@valar/vue-ui/button";
import { Checkbox } from "@valar/vue-ui/checkbox";
import { Empty, EmptyTitle } from "@valar/vue-ui/empty";
import { Input } from "@valar/vue-ui/input";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@valar/vue-ui/table";
import { computed, useId } from "vue";

const data = [
	{ id: "PAY-34", email: "mira@example.com", status: "Paid", amount: "$316.00" },
	{ id: "PAY-21", email: "abe@example.com", status: "Pending", amount: "$242.00" },
	{ id: "PAY-87", email: "zoe@example.com", status: "Paid", amount: "$837.00" },
	{ id: "PAY-56", email: "lin@example.com", status: "Failed", amount: "$109.00" },
];
const features = tableFeatures({
	columnFilteringFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	filteredRowModel: createFilteredRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	sortedRowModel: createSortedRowModel(),
	filterFns: { includesString: filterFn_includesString },
	sortFns: { text: sortFn_text },
});
const column = createColumnHelper<typeof features, (typeof data)[number]>();
const columns = column.columns([
	column.display({ id: "select", enableHiding: false }),
	column.accessor("email", { header: "Email", filterFn: "includesString", sortFn: "text" }),
	column.accessor("status", { header: "Status" }),
	column.accessor("amount", { header: "Amount" }),
]);
const table = useTable<typeof features, (typeof data)[number]>({
	features,
	columns,
	data,
	getRowId: (row: (typeof data)[number]) => row.id,
	initialState: { pagination: { pageSize: 2, pageIndex: 0 } },
});
const email = table.getColumn("email")!;
const amount = table.getColumn("amount")!;
const rows = computed(() => table.getRowModel().rows);
const pageSelection = computed(
	() =>
		table.getIsAllPageRowsSelected() ||
		(table.getIsSomePageRowsSelected() ? "indeterminate" : false)
);
const sort = computed(() => email.getIsSorted());
const showAmountId = useId();
</script>

<template>
	<section aria-label="Data Table examples" class="grid w-full max-w-2xl min-w-0 gap-4 p-6 text-sm">
		<div class="flex flex-wrap items-center gap-3">
			<Input
				aria-label="Filter by email"
				placeholder="Filter by email"
				class="w-full max-w-56"
				:model-value="String(email.getFilterValue() ?? '')"
				@update:model-value="email.setFilterValue($event)"
			/>
			<div class="flex items-center gap-2">
				<Checkbox
					:id="showAmountId"
					:model-value="amount.getIsVisible()"
					@update:model-value="amount.toggleVisibility($event === true)"
				/>
				<label :for="showAmountId">Show amount</label>
			</div>
		</div>
		<Table scroll-label="Scroll recent payments" class="min-w-[420px]">
			<TableCaption>Recent payments</TableCaption>
			<TableHeader>
				<TableRow v-for="group in table.getHeaderGroups()" :key="group.id">
					<TableHead
						v-for="header in group.headers"
						:key="header.id"
						scope="col"
						:class="header.column.id === 'amount' ? 'text-end' : undefined"
						:aria-sort="
							header.column.id !== 'email'
								? undefined
								: sort === 'asc'
									? 'ascending'
									: sort === 'desc'
										? 'descending'
										: 'none'
						"
					>
						<Checkbox
							v-if="header.column.id === 'select'"
							aria-label="Select this page"
							:disabled="!rows.length"
							:model-value="pageSelection"
							@update:model-value="table.toggleAllPageRowsSelected($event === true)"
						/>
						<Button
							v-else-if="header.column.id === 'email'"
							size="sm"
							variant="ghost"
							@click="email.toggleSorting()"
							>Sort by email
							<span v-if="sort" aria-hidden="true">{{ sort === "asc" ? "↑" : "↓" }}</span></Button
						>
						<FlexRender v-else :header="header" />
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<template v-if="rows.length">
					<TableRow
						v-for="row in rows"
						:key="row.id"
						:data-state="row.getIsSelected() ? 'selected' : undefined"
					>
						<TableCell
							v-for="cell in row.getVisibleCells()"
							:key="cell.id"
							:class="cell.column.id === 'amount' ? 'text-end tabular-nums' : undefined"
						>
							<Checkbox
								v-if="cell.column.id === 'select'"
								:aria-label="`Select ${row.original.email}`"
								:model-value="row.getIsSelected()"
								@update:model-value="row.toggleSelected($event === true)"
							/>
							<FlexRender v-else :cell="cell" />
						</TableCell>
					</TableRow>
				</template>
				<TableRow v-else
					><TableCell :colspan="table.getVisibleLeafColumns().length"
						><Empty appearance="filtered-list"
							><EmptyTitle>No matching payments</EmptyTitle
							><Button size="sm" variant="ghost" @click="email.setFilterValue('')"
								>Clear filter</Button
							></Empty
						></TableCell
					></TableRow
				>
			</TableBody>
		</Table>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<p role="status">{{ table.getSelectedRowModel().rows.length }} selected</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					:disabled="!table.getCanPreviousPage()"
					@click="table.previousPage()"
					>Previous page</Button
				>
				<Button
					variant="outline"
					size="sm"
					:disabled="!table.getCanNextPage()"
					@click="table.nextPage()"
					>Next page</Button
				>
			</div>
		</div>
	</section>
</template>
