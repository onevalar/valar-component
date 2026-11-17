<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Pagination from "$lib/registry/ui/pagination/index.js";

	const sessions = [
		"Review release notes",
		"Summarize issue comments",
		"Find related tests",
		"Draft usage report",
		"Verify billing copy",
		"Check keyboard coverage",
		"Compare navigation behavior",
	];
	const perPage = 3;
	const listId = $props.id();
	const csv = `data:text/csv;charset=utf-8,${encodeURIComponent(["Session", ...sessions].join("\n"))}`;

	let page = $state(1);
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const rows = $derived(sessions.slice((page - 1) * perPage, page * perPage));
	const formatResults = ({
		start,
		end,
		total,
	}: Pagination.PaginationResultRange) => {
		if (start <= 1 && end === total)
			return text(`${total} 个结果`, `${total} results`);
		return text(
			`第 ${start}–${end} 条，共 ${total} 个结果`,
			`${start}–${end} of ${total} results`,
		);
	};
</script>

<div class="grid w-full max-w-xl min-w-0 gap-4">
	<section
		aria-label={text("用量记录", "Usage records")}
		class="min-w-0 rounded-lg border"
	>
		<div
			class="flex min-h-11 flex-wrap items-center justify-between gap-2 px-2 py-2"
		>
			<Pagination.Results
				count={sessions.length}
				{perPage}
				bind:page
				aria-label={text("用量记录分页", "Usage results pagination")}
				aria-controls={listId}
				previousLabel={text("上一页", "Back")}
				nextLabel={text("下一页", "Forward")}
				{formatResults}
			/>
			<Button
				variant="outline"
				size="sm"
				href={csv}
				download="usage-results.csv"
			>
				{text("导出 CSV", "Export CSV")}
			</Button>
		</div>
		<ul
			id={listId}
			class="divide-y border-t text-[13px]"
			aria-label={text("会话", "Sessions")}
		>
			{#each rows as row (row)}
				<li class="px-2.5 py-2.5">{row}</li>
			{/each}
		</ul>
	</section>

	<section
		aria-label={text("无用量结果", "No usage records")}
		class="min-w-0 rounded-lg border"
	>
		<div
			class="flex min-h-11 flex-wrap items-center justify-between gap-2 px-2 py-2"
		>
			<Pagination.Results
				count={0}
				aria-label={text("空结果分页", "Empty results pagination")}
				previousLabel={text("上一页", "Back")}
				nextLabel={text("下一页", "Forward")}
				{formatResults}
			/>
			<Button variant="outline" size="sm" disabled
				>{text("导出 CSV", "Export CSV")}</Button
			>
		</div>
	</section>
</div>
