<script setup lang="ts">
import { Checkbox } from "@valar/vue-ui/checkbox";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@valar/vue-ui/table";
import { ref } from "vue";

const labels = [
	{ id: "bug", name: "Bug", description: "Problems that need fixing", issues: 12 },
	{ id: "design", name: "Design", description: "Workspace design updates", issues: 3 },
];
const selected = ref<string[]>([]);
</script>

<template>
	<section aria-label="Table examples" class="grid max-w-2xl min-w-0 gap-4 p-6 text-sm">
		<h2 class="font-semibold">Issue labels</h2>
		<Table appearance="settings" scroll-label="Scroll issue labels" class="min-w-[420px]">
			<TableCaption class="sr-only">Workspace issue labels</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead scope="col" class="w-10"><span class="sr-only">Selection</span></TableHead>
					<TableHead scope="col">Name</TableHead>
					<TableHead scope="col">Description</TableHead>
					<TableHead scope="col" class="text-end">Issues</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow
					v-for="{ id, name, description, issues } in labels"
					:key="id"
					:data-state="selected.includes(id) ? 'selected' : undefined"
				>
					<TableCell>
						<Checkbox
							:aria-label="`Select ${name}`"
							:model-value="selected.includes(id)"
							@update:model-value="
								(checked) =>
									(selected =
										checked === true ? [...selected, id] : selected.filter((value) => value !== id))
							"
						/>
					</TableCell>
					<TableCell>{{ name }}</TableCell>
					<TableCell>{{ description }}</TableCell>
					<TableCell class="text-end tabular-nums">{{ issues }}</TableCell>
				</TableRow>
			</TableBody>
		</Table>
		<p role="status">{{ selected.length }} of {{ labels.length }} labels selected</p>
	</section>
</template>
