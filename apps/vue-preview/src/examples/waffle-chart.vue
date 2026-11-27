<script setup lang="ts">
import { WaffleChart } from "@valar/vue-ui/waffle-chart";
import { ref } from "vue";

const issues = [
	{ key: "Design", value: 5, color: "var(--chart-1)" },
	{ key: "Bug", value: 2, color: "var(--chart-2)" },
	{ key: "Docs", value: 2, color: "var(--chart-3)" },
];
const showEmpty = ref(false);
</script>

<template>
	<figure class="grid justify-items-start gap-3 p-6 text-sm">
		<WaffleChart :data="showEmpty ? [] : issues" label="Issues by type" class="w-32" />
		<figcaption>
			{{ showEmpty ? "No issues in this period" : "Design 5 · Bug 2 · Docs 2" }}
		</figcaption>
		<label class="flex items-center gap-2">
			<input v-model="showEmpty" type="checkbox" />
			Show empty period
		</label>
	</figure>
</template>
