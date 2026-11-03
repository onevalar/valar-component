<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import * as Pagination from "$lib/registry/ui/pagination/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { PAGINATION_SPEC } from "./pagination-tuning.js";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const perPage = 5;
	const records = Array.from({ length: 120 }, (_, index) => ({
		id: index + 1,
		title: `设计资源 ${String(index + 1).padStart(3, "0")}`,
	}));
	let pages = $state({ current: 1, before: 1 });
	async function focusContent(pane: "current" | "before") {
		await tick();
		document.getElementById(`${id}-${pane}-heading`)?.focus();
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-5 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			真实 Bits 分页驱动 120 条资源，每页 5
			条；页码由组件生成，首尾自动禁用。翻页后聚焦列表标题，按钮高度沿用 Button。
		</p>
		<section class="grid min-w-0 gap-3" aria-labelledby={`${id}-${pane}-heading`}>
			<h3
				id={`${id}-${pane}-heading`}
				tabindex="-1"
				class="rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
			>
				资源列表 · 第 {pages[pane]} 页
			</h3>
			<ul class="grid min-w-0 gap-2">
				{#each records.slice((pages[pane] - 1) * perPage, pages[pane] * perPage) as record (record.id)}
					<li class="min-w-0 rounded-md border p-3 text-sm">{record.title}</li>
				{/each}
			</ul>
		</section>
		<div class="min-w-0 overflow-x-auto p-1 pb-3">
			<Pagination.Root
				id={`${id}-${pane}-pagination`}
				class="min-w-max"
				count={records.length}
				{perPage}
				siblingCount={0}
				bind:page={pages[pane]}
				onPageChange={() => focusContent(pane)}
				aria-controls={`${id}-${pane}-heading`}
			>
				{#snippet children({ pages: items, currentPage })}
					<Pagination.Content>
						<Pagination.Item><Pagination.Previous /></Pagination.Item>
						{#each items as item (item.key)}
							<Pagination.Item>
								{#if item.type === "ellipsis"}
									<Pagination.Ellipsis />
								{:else}
									<Pagination.Link page={item} isActive={currentPage === item.value} />
								{/if}
							</Pagination.Item>
						{/each}
						<Pagination.Item><Pagination.Next /></Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
		<p role="status" class="text-xs text-muted-foreground">
			显示 {(pages[pane] - 1) * perPage + 1}–{Math.min(pages[pane] * perPage, records.length)} 条，共
			{records.length} 条。
		</p>
	</div>
{/snippet}

<ComponentTuner spec={PAGINATION_SPEC} {canvas}>{@render children()}</ComponentTuner>
