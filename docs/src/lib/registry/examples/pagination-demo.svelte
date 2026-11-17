<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import * as Pagination from "$lib/registry/ui/pagination/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
</script>

<ScrollArea.Root
	orientation="horizontal"
	type="hover"
	class="w-full max-w-full [contain:inline-size]"
	viewportLabel={text("滚动页码", "Scroll page numbers")}
>
	<Pagination.Root
		count={100}
		perPage={10}
		page={4}
		class="min-w-max"
		aria-label={text("页码分页", "Numbered pagination")}
	>
		{#snippet children({ pages, currentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.Previous
						label={text("上一页", "Previous")}
						aria-label={text("上一页", "Previous page")}
					/>
				</Pagination.Item>
				{#each pages as page (page.key)}
					<Pagination.Item>
						{#if page.type === "ellipsis"}
							<Pagination.Ellipsis />
						{:else}
							<Pagination.Link {page} isActive={currentPage === page.value}>
								{page.value}
							</Pagination.Link>
						{/if}
					</Pagination.Item>
				{/each}
				<Pagination.Item>
					<Pagination.Next
						label={text("下一页", "Next")}
						aria-label={text("下一页", "Next page")}
					/>
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>
</ScrollArea.Root>
