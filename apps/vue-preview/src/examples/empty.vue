<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@valar/vue-ui/empty";
import { nextTick, ref, useTemplateRef } from "vue";

const filtered = ref(true);
const results = useTemplateRef<HTMLParagraphElement>("results");

async function clearFilters() {
	filtered.value = false;
	await nextTick();
	results.value?.focus();
}
</script>

<template>
	<section aria-label="Empty examples" class="grid w-full max-w-lg gap-4 p-6 text-sm">
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round"
					>
						<path d="M4 7h6l2 2h8v10H4Z" />
					</svg>
				</EmptyMedia>
				<EmptyTitle>No saved views yet</EmptyTitle>
				<EmptyDescription
					>Saved issue views will appear here when you create them.</EmptyDescription
				>
			</EmptyHeader>
		</Empty>
		<div class="grid min-h-36 items-center rounded-lg border-[0.5px] border-border">
			<Empty v-if="filtered" appearance="filtered-list">
				<EmptyHeader>
					<EmptyTitle>No matching issues</EmptyTitle>
					<EmptyDescription>No issues in this view are marked urgent.</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button size="xs" variant="outline" @click="clearFilters">Clear filters</Button>
				</EmptyContent>
			</Empty>
			<p
				v-else
				ref="results"
				tabindex="-1"
				class="mx-3 p-2 focus:outline-1 focus:-outline-offset-1 focus:outline-ring"
			>
				VLR-103 · Improve the issue list filters
			</p>
		</div>
	</section>
</template>
