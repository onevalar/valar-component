<script setup lang="ts">
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@valar/vue-ui/pagination";
</script>

<template>
	<section aria-label="Pagination examples" class="grid w-full max-w-lg gap-3 p-6 text-sm">
		<Pagination v-slot="{ pages, range }" aria-label="Issues pages" :count="95" :default-page="2">
			<div class="grid gap-2">
				<PaginationContent>
					<PaginationItem><PaginationPrevious label="Previous" /></PaginationItem>
					<PaginationItem v-for="page in pages" :key="page.key">
						<PaginationLink v-if="page.type === 'page'" :page="page" />
						<PaginationEllipsis v-else label="More pages" />
					</PaginationItem>
					<PaginationItem><PaginationNext label="Next" /></PaginationItem>
				</PaginationContent>
				<output class="text-center text-xs text-muted-foreground tabular-nums">
					Issues {{ range.start }}–{{ range.end }} of 95
				</output>
			</div>
		</Pagination>
	</section>
</template>
