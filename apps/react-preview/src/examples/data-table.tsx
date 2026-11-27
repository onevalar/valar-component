import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createColumnHelper,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFn_includesString,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { Button } from "@valar/react-ui/button";
import { Checkbox } from "@valar/react-ui/checkbox";
import { Empty, EmptyTitle } from "@valar/react-ui/empty";
import { Input } from "@valar/react-ui/input";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@valar/react-ui/table";
import { useId } from "react";

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

export default function DataTableExample() {
	const table = useTable({
		features,
		columns,
		data,
		getRowId: (row) => row.id,
		initialState: { pagination: { pageSize: 2, pageIndex: 0 } },
	});
	const email = table.getColumn("email")!;
	const amount = table.getColumn("amount")!;
	const rows = table.getRowModel().rows;
	const allSelected = table.getIsAllPageRowsSelected();
	const showAmountId = useId();
	return (
		<section
			aria-label="Data Table examples"
			className="grid w-full max-w-2xl min-w-0 gap-4 p-6 text-sm"
		>
			<div className="flex flex-wrap items-center gap-3">
				<Input
					aria-label="Filter by email"
					placeholder="Filter by email"
					className="w-full max-w-56"
					value={String(email.getFilterValue() ?? "")}
					onChange={(event) => email.setFilterValue(event.currentTarget.value)}
				/>
				<div className="flex items-center gap-2">
					<Checkbox
						id={showAmountId}
						checked={amount.getIsVisible()}
						onCheckedChange={(visible) => amount.toggleVisibility(visible === true)}
					/>
					<label htmlFor={showAmountId}>Show amount</label>
				</div>
			</div>
			<Table scrollLabel="Scroll recent payments" className="min-w-[420px]">
				<TableCaption>Recent payments</TableCaption>
				<TableHeader>
					{table.getHeaderGroups().map((group) => (
						<TableRow key={group.id}>
							{group.headers.map((header) => {
								const field = header.column.id;
								const sort = header.column.getIsSorted();
								return (
									<TableHead
										key={header.id}
										scope="col"
										className={field === "amount" ? "text-end" : undefined}
										aria-sort={
											field !== "email"
												? undefined
												: sort === "asc"
													? "ascending"
													: sort === "desc"
														? "descending"
														: "none"
										}
									>
										{field === "select" ? (
											<Checkbox
												aria-label="Select this page"
												disabled={!rows.length}
												checked={
													allSelected ||
													(table.getIsSomePageRowsSelected() ? "indeterminate" : false)
												}
												onCheckedChange={(checked) =>
													table.toggleAllPageRowsSelected(checked === true)
												}
											/>
										) : field === "email" ? (
											<Button size="sm" variant="ghost" onClick={() => email.toggleSorting()}>
												Sort by email{" "}
												{sort && <span aria-hidden="true">{sort === "asc" ? "↑" : "↓"}</span>}
											</Button>
										) : (
											<table.FlexRender header={header} />
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{rows.length ? (
						rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className={cell.column.id === "amount" ? "text-end tabular-nums" : undefined}
									>
										{cell.column.id === "select" ? (
											<Checkbox
												aria-label={`Select ${row.original.email}`}
												checked={row.getIsSelected()}
												onCheckedChange={(checked) => row.toggleSelected(checked === true)}
											/>
										) : (
											<table.FlexRender cell={cell} />
										)}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={table.getVisibleLeafColumns().length}>
								<Empty appearance="filtered-list">
									<EmptyTitle>No matching payments</EmptyTitle>
									<Button size="sm" variant="ghost" onClick={() => email.setFilterValue("")}>
										Clear filter
									</Button>
								</Empty>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p role="status">{table.getSelectedRowModel().rows.length} selected</p>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={!table.getCanPreviousPage()}
						onClick={() => table.previousPage()}
					>
						Previous page
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={!table.getCanNextPage()}
						onClick={() => table.nextPage()}
					>
						Next page
					</Button>
				</div>
			</div>
		</section>
	);
}
