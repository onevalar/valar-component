<script setup lang="ts">
import { Combobox } from "@valar/vue-ui/combobox";
import { ref } from "vue";

const projects = [
	{ id: "launch", label: "Launch plan", group: "Active projects", keywords: ["release", "发布"] },
	{ id: "design", label: "Design systems", group: "Active projects" },
	{ id: "docs", label: "Documentation", group: "Other projects" },
];
const primary = ref<readonly string[]>([]);
const related = ref<readonly string[]>(["launch"]);
</script>

<template>
	<section
		aria-label="Combobox examples"
		class="grid max-w-md justify-items-start gap-4 p-6 text-sm"
	>
		<Combobox
			v-model="primary"
			label="Primary project"
			placeholder="Search projects…"
			:options="projects"
			clearable
			clear-label="Clear primary project"
			empty="No matching projects"
		/>
		<Combobox
			v-model="related"
			label="Related projects"
			placeholder="Search projects…"
			:options="projects"
			multiple
			clearable
			clear-label="Clear related projects"
			empty="No matching projects"
		/>
		<p role="status">{{ related.length }} related projects selected</p>
	</section>
</template>
