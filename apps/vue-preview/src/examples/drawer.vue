<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@valar/vue-ui/drawer";

const filters = ["Assigned to me", "In progress", "Needs review", "Unassigned"];
</script>

<template>
	<section aria-label="Drawer examples" class="flex flex-wrap gap-3 p-6 text-sm">
		<Drawer :should-scale-background="false">
			<DrawerTrigger as-child><Button variant="outline">Open filters</Button></DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Issue filters</DrawerTitle>
					<DrawerDescription>Choose the issue groups to show.</DrawerDescription>
				</DrawerHeader>
				<div class="grid min-h-0 gap-3 overflow-y-auto px-4 pb-4">
					<label v-for="filter in filters" :key="filter" class="flex items-center gap-2">
						<input type="checkbox" :checked="filter === 'Assigned to me'" />
						{{ filter }}
					</label>
				</div>
				<DrawerFooter
					><DrawerClose as-child><Button>Done</Button></DrawerClose></DrawerFooter
				>
			</DrawerContent>
		</Drawer>
		<Drawer direction="right" :should-scale-background="false">
			<DrawerTrigger as-child><Button variant="outline">Open activity</Button></DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Recent activity</DrawerTitle>
					<DrawerDescription>Updates to your workspace.</DrawerDescription>
				</DrawerHeader>
				<p class="px-4">Jordan published the project notes.</p>
				<DrawerFooter
					><DrawerClose as-child
						><Button variant="outline">Close activity</Button></DrawerClose
					></DrawerFooter
				>
			</DrawerContent>
		</Drawer>
	</section>
</template>
