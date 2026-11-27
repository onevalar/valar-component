<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@valar/vue-ui/dropdown-menu";
import { ref } from "vue";

const showCompleted = ref(false);
const refreshCount = ref(0);
</script>

<template>
	<section
		aria-label="Dropdown Menu examples"
		class="grid w-full max-w-sm justify-items-start gap-3 p-6 text-sm"
	>
		<DropdownMenu>
			<DropdownMenuTrigger as-child>
				<Button variant="outline">View options</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" class="min-w-44">
				<DropdownMenuCheckboxItem v-model="showCompleted">Show completed</DropdownMenuCheckboxItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem @select="refreshCount++">Refresh issues</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
		<ul
			aria-label="Launch issues"
			class="grid gap-1 rounded-lg border-[0.5px] border-border bg-card p-3"
		>
			<li>Review launch checklist</li>
			<li v-if="showCompleted">
				Confirm launch date <span class="text-muted-foreground">· Done</span>
			</li>
		</ul>
		<p role="status" class="text-muted-foreground">Refresh count: {{ refreshCount }}</p>
	</section>
</template>
