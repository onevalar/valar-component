<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@valar/vue-ui/context-menu";
import { ref } from "vue";

const statuses = ["Todo", "In progress", "Done"];
const status = ref("Todo");
</script>

<template>
	<section aria-label="Context Menu examples" class="grid w-full max-w-sm gap-3 p-6 text-sm">
		<ContextMenu>
			<ContextMenuTrigger
				role="group"
				aria-label="Issue VAL-42"
				tabindex="0"
				class="grid gap-1 rounded-lg border-[0.5px] border-border bg-card p-3 outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
			>
				<p class="font-medium">VAL-42 · Review launch checklist</p>
				<p role="status" class="text-muted-foreground">Status: {{ status }}</p>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem @select="status = 'Todo'">Move to Todo</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuItem
							v-for="value in statuses.slice(1)"
							:key="value"
							@select="status = value"
						>
							{{ value }}
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
			</ContextMenuContent>
		</ContextMenu>
		<div role="group" aria-label="Set issue status" class="flex flex-wrap gap-2">
			<Button
				v-for="value in statuses"
				:key="value"
				size="sm"
				variant="outline"
				:aria-pressed="status === value"
				@click="status = value"
			>
				{{ value }}
			</Button>
		</div>
	</section>
</template>
