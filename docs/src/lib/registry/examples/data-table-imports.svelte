<script lang="ts">
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ListFilterIcon from "@lucide/svelte/icons/list-filter";
	import SearchIcon from "@lucide/svelte/icons/search";
	import XIcon from "@lucide/svelte/icons/x";
	import {
		createColumnHelper,
		createSortedRowModel,
		createTable,
		rowSortingFeature,
		sortFn_text,
		tableFeatures
	} from "@tanstack/svelte-table";
	import { tick } from "svelte";
	import { getLocale } from "$lib/i18n/index.js";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as Table from "$lib/registry/ui/table/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ImportActions from "./data-table/data-table-import-actions.svelte";

	type ImportRecord = {
		id: string;
		source: string;
		target: string;
		creator: string;
		created: string;
		count: number;
		status: "complete" | "error";
	};
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const entries: ImportRecord[] = [
		{
			id: "src-1",
			source: "Asana",
			target: "Operations",
			creator: "Mina Chen",
			created: "2026-11-16",
			count: 0,
			status: "error"
		},
		{
			id: "src-2",
			source: "CSV",
			target: "Design",
			creator: "Alex Rivera",
			created: "2026-11-10",
			count: 14,
			status: "complete"
		},
		{
			id: "src-3",
			source: "GitHub",
			target: "Engineering",
			creator: "Sam Lee",
			created: "2026-11-12",
			count: 28,
			status: "complete"
		}
	];
	const statusLabel = (status: ImportRecord["status"]) =>
		status === "error" ? text("错误", "Error") : text("完成", "Complete");
	const labels = $derived({
		source: text("来源", "Source"),
		target: text("目标", "Target"),
		creator: text("创建者", "Created by"),
		created: text("创建时间", "Created"),
		summary: text("摘要", "Summary"),
		status: text("状态", "Status"),
		actions: text("操作", "Actions")
	});
	const dateFormat = $derived(
		new Intl.DateTimeFormat(getLocale(), {
			month: "short",
			day: "numeric",
			timeZone: "UTC"
		})
	);
	const resultsId = $props.id();
	let records = $state(entries);
	let selectedStatus = $state("all");
	let query = $state("");
	let input = $state<HTMLInputElement | null>(null);
	let feedback = $state("");
	const matches = $derived.by(() => {
		const term = query.trim().toLowerCase();
		return records.filter(
			(record) =>
				(selectedStatus === "all" || record.status === selectedStatus) &&
				[record.source, record.target, record.creator, statusLabel(record.status)].some((value) =>
					value.toLowerCase().includes(term)
				)
		);
	});
	const features = tableFeatures({
		rowSortingFeature,
		sortedRowModel: createSortedRowModel(),
		sortFns: { text: sortFn_text }
	});
	const column = createColumnHelper<typeof features, ImportRecord>();
	const table = createTable({
		features,
		get data() {
			return matches;
		},
		columns: column.columns([
			column.accessor("source", { sortFn: "text" }),
			column.accessor("target", { sortFn: "text" }),
			column.accessor("creator", { sortFn: "text" }),
			column.accessor("created", { sortFn: "text" }),
			column.display({ id: "summary" }),
			column.accessor("status", { sortFn: "text" }),
			column.display({ id: "actions" })
		]),
		getRowId: (row) => row.id,
		initialState: { sorting: [{ id: "created", desc: true }] }
	});

	function clear() {
		query = "";
		input?.focus();
	}

	function troubleshoot(record: ImportRecord) {
		feedback =
			record.status === "error"
				? text(
						`${record.source} 导入失败。请检查来源设置。`,
						`${record.source} import failed. Review the source settings.`
					)
				: text(`${record.source} 导入已完成。`, `${record.source} import complete.`);
	}

	async function remove(record: ImportRecord) {
		records = records.filter(({ id }) => id !== record.id);
		feedback = text(
			`已删除 ${record.source} 导入示例。`,
			`Removed the ${record.source} example import.`
		);
		await tick();
		input?.focus();
	}
</script>

<div class="grid w-full max-w-[68rem] min-w-0 gap-2">
	<div class="flex min-w-0 items-center gap-2 px-2">
		<InputGroup.Root
			appearance="settings-search"
			class="max-w-[300px] flex-1 shadow-none data-[appearance=settings-search]:rounded-full [--valar-settings-search-surface:lch(97.94%_.5_282)] [--valar-settings-search-border:transparent] dark:[--valar-settings-search-surface:lch(5.52%_.4_272)] dark:[--valar-settings-search-border:lch(27.12%_1.48_272)]"
		>
			<InputGroup.Input
				bind:ref={input}
				bind:value={query}
				type="search"
				aria-label={text("筛选导入记录", "Filter imports")}
				aria-controls={resultsId}
				placeholder={text("筛选导入记录…", "Filter imports…")}
				onkeydown={(event) => {
					if (event.key !== "Escape" || !query) return;
					event.preventDefault();
					event.stopPropagation();
					clear();
				}}
			/>
			<InputGroup.Addon aria-hidden="true"><SearchIcon /></InputGroup.Addon>
			<InputGroup.Addon align="inline-end">
				{#if query}
					<InputGroup.Button
						size="icon-xs"
						aria-label={text("清除筛选", "Clear filter")}
						onclick={clear}
					>
						<XIcon class="size-3" />
					</InputGroup.Button>
				{/if}
			</InputGroup.Addon>
		</InputGroup.Root>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						aria-label={text("按导入状态筛选", "Filter by import status")}
						variant={selectedStatus === "all" ? "ghost" : "secondary"}
						size="icon-sm"
						shape="pill"
					>
						<ListFilterIcon aria-hidden="true" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.RadioGroup bind:value={selectedStatus}>
					<DropdownMenu.RadioItem value="all"
						>{text("全部状态", "All statuses")}</DropdownMenu.RadioItem
					>
					<DropdownMenu.RadioItem value="complete">{statusLabel("complete")}</DropdownMenu.RadioItem
					>
					<DropdownMenu.RadioItem value="error">{statusLabel("error")}</DropdownMenu.RadioItem>
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div id={resultsId} class="min-w-0 border-y border-border">
		{#if matches.length}
			<Table.Root
				appearance="settings"
				scroll="overlay"
				scrollLabel={text("导入记录的列", "Import columns")}
				class="min-w-[42rem] [&>[data-slot=table-header]]:bg-transparent dark:[&>[data-slot=table-header]]:bg-transparent"
			>
				<Table.Caption class="sr-only">{text("工作区导入记录", "Workspace imports")}</Table.Caption>
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as { column: current, id } (id)}
								{@const label = labels[current.id as keyof typeof labels]}
								{@const sorted = current.getIsSorted()}
								<Table.Head
									scope="col"
									aria-sort={sorted === "asc"
										? "ascending"
										: sorted === "desc"
											? "descending"
											: undefined}
								>
									{#if current.getCanSort()}
										<button
											type="button"
											aria-label={text(`按${label}排序`, `Order by ${label}`)}
											class="inline-flex h-6 items-center gap-0.5 rounded-full px-1.5 text-xs font-medium hover:bg-muted focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
											onclick={() => current.toggleSorting(sorted === "asc", false)}
										>
											{label}
											{#if sorted === "asc"}<ArrowUpIcon
													class="size-3"
													aria-hidden="true"
												/>{:else if sorted === "desc"}<ArrowDownIcon
													class="size-3"
													aria-hidden="true"
												/>{/if}
										</button>
									{:else if current.id === "actions"}
										<span class="sr-only">{label}</span>
									{:else}
										{label}
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#each table.getRowModel().rows as { original: record } (record.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{record.source}</Table.Cell>
							<Table.Cell>{record.target}</Table.Cell>
							<Table.Cell>{record.creator}</Table.Cell>
							<Table.Cell
								><time datetime={record.created}>{dateFormat.format(new Date(record.created))}</time
								></Table.Cell
							>
							<Table.Cell>
								{#if record.status === "error"}
									<Button
										variant="link"
										size="xs"
										class="text-destructive"
										onclick={() => troubleshoot(record)}
										>{text("查看错误", "Read the error")}</Button
									>
								{:else}
									{text(`已导入 ${record.count} 条`, `${record.count} imported`)}
								{/if}
							</Table.Cell>
							<Table.Cell
								class={record.status === "error" ? "text-destructive" : "text-muted-foreground"}
								>{statusLabel(record.status)}</Table.Cell
							>
							<Table.Cell class="w-12 text-end"
								><ImportActions
									source={record.source}
									onTroubleshoot={() => troubleshoot(record)}
									onRemove={() => remove(record)}
								/></Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{:else}
			<Empty.Root class="min-h-32" role="status">
				<Empty.Title>{text("没有匹配的导入记录", "No matching imports")}</Empty.Title>
			</Empty.Root>
		{/if}
	</div>
	<div role="status" class="px-2 text-xs text-muted-foreground empty:sr-only">{feedback}</div>
</div>
