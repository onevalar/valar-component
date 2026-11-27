<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPanel,
	SheetTitle,
	SheetTrigger,
} from "@valar/vue-ui/sheet";
import { ref, useId, useTemplateRef } from "vue";

const panelId = useId();
const panelTrigger = useTemplateRef<HTMLButtonElement>("panelTrigger");
const panelOpen = ref(false);
const pinned = ref(false);
</script>

<template>
	<section
		aria-label="Sheet examples"
		class="grid w-full max-w-3xl content-start items-start gap-3 p-6 text-sm md:grid-cols-[minmax(0,1fr)_auto]"
	>
		<div class="grid gap-3">
			<h2 class="font-medium">Launch plan</h2>
			<div class="flex flex-wrap gap-2">
				<Sheet>
					<SheetTrigger as-child>
						<Button size="sm" variant="outline">Open project details</Button>
					</SheetTrigger>
					<SheetContent side="right" close-label="Close project details">
						<SheetHeader>
							<SheetTitle>Project details</SheetTitle>
							<SheetDescription>Launch plan for the Design Systems team.</SheetDescription>
						</SheetHeader>
						<dl
							class="grid min-h-0 flex-1 grid-cols-[auto_1fr] content-start gap-x-3 gap-y-2 overflow-y-auto px-4"
						>
							<dt class="text-muted-foreground">Lead</dt>
							<dd>Jordan Davis</dd>
							<dt class="text-muted-foreground">Status</dt>
							<dd>In progress</dd>
						</dl>
						<SheetFooter>
							<SheetClose as-child><Button size="sm" variant="outline">Done</Button></SheetClose>
						</SheetFooter>
					</SheetContent>
				</Sheet>
				<Button as-child size="sm" variant="outline">
					<button
						ref="panelTrigger"
						type="button"
						:aria-expanded="panelOpen"
						:aria-controls="panelId"
						@click="panelOpen = !panelOpen"
					>
						Project activity
					</button>
				</Button>
			</div>
		</div>
		<SheetPanel
			v-model:open="panelOpen"
			:id="panelId"
			label="Project activity"
			:trigger="panelTrigger"
			class="max-h-64 md:w-[400px]"
		>
			<div
				class="grid justify-items-start gap-2 rounded-lg border-[0.5px] border-border bg-card p-3"
			>
				<h3 class="font-medium">Activity</h3>
				<p class="text-muted-foreground">Jordan updated the launch checklist.</p>
				<Button size="sm" variant="outline" :aria-pressed="pinned" @click="pinned = !pinned"
					>Pin update</Button
				>
			</div>
		</SheetPanel>
	</section>
</template>
