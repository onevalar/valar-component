<script setup lang="ts">
import { ScrollArea } from "@valar/vue-ui/scroll-area";
import { Separator } from "@valar/vue-ui/separator";

const activity = [
	"Jordan created the Design systems project",
	"Sam added the release checklist",
	"Alex opened the filter review",
	"Rory updated project milestones",
	"Jordan approved the icon changes",
	"Sam closed the accessibility issue",
	"Alex shared the release notes",
	"Rory archived the old workspace view",
];
const weeks = ["Nov 02–08", "Nov 09–15", "Nov 16–22", "Nov 23–29", "Nov 30–Dec 06"];
</script>

<template>
	<section aria-label="Scroll Area examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<ScrollArea
			appearance="settings"
			viewport-label="Recent activity"
			overscroll="contain"
			class="h-36 rounded-lg border-[0.5px] border-border"
		>
			<ul class="min-w-0 px-3">
				<li v-for="(event, index) in activity" :key="event">
					<Separator v-if="index > 0" decorative />
					<p class="py-2 pr-2">{{ event }}</p>
				</li>
			</ul>
		</ScrollArea>
		<ScrollArea
			orientation="horizontal"
			type="auto"
			viewport-label="Project weeks"
			class="rounded-lg border-[0.5px] border-border"
		>
			<ul class="flex w-max gap-2 p-2 pb-3 tabular-nums">
				<li v-for="week in weeks" :key="week" class="rounded-md bg-muted px-3 py-1">{{ week }}</li>
			</ul>
		</ScrollArea>
	</section>
</template>
