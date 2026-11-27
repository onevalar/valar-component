<script setup lang="ts">
import { Badge } from "@valar/vue-ui/badge";
import { Button } from "@valar/vue-ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
} from "@valar/vue-ui/item";
import { ref } from "vue";

const issues = [
	{ id: "VLR-103", title: "Improve the saved workspace filters on narrow screens", date: "Nov 12" },
	{ id: "VLR-107", title: "Review keyboard shortcuts", date: "Nov 18" },
];
const selected = ref(issues[0]);
const watched = ref(false);
</script>

<template>
	<section aria-label="Item examples" class="grid w-full max-w-lg grid-cols-1 gap-4 p-6 text-sm">
		<ItemGroup aria-label="Open issues">
			<div v-for="(issue, index) in issues" :key="issue.id" role="listitem">
				<ItemSeparator v-if="index > 0" decorative />
				<Item
					as="button"
					appearance="issue-row"
					:aria-current="selected === issue ? 'true' : undefined"
					class="text-start"
					@click="selected = issue"
				>
					<span class="shrink-0 text-xs text-muted-foreground tabular-nums">{{ issue.id }}</span>
					<span class="min-w-0 flex-1 truncate font-medium">{{ issue.title }}</span>
					<span class="shrink-0 text-xs text-muted-foreground">{{ issue.date }}</span>
				</Item>
			</div>
		</ItemGroup>
		<Item variant="outline" size="sm">
			<ItemContent>
				<ItemTitle class="gap-2"
					>Selected issue <Badge variant="outline">{{ selected.id }}</Badge></ItemTitle
				>
				<ItemDescription>{{ selected.title }}</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button size="sm" variant="outline" :aria-pressed="watched" @click="watched = !watched">
					Watch list
				</Button>
			</ItemActions>
		</Item>
	</section>
</template>
