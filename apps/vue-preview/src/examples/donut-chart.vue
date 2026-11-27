<script setup lang="ts">
import { StaticDonut } from "@valar/vue-ui/donut-chart";
import { ref } from "vue";

const usage = [
	{ key: "Compute", value: 47, color: "var(--chart-1)" },
	{ key: "Storage", value: 22, color: "var(--chart-2)" },
];
const showStorage = ref(true);
</script>

<template>
	<figure aria-label="Usage by service" class="grid justify-items-start gap-3 p-6 text-sm">
		<StaticDonut :parts="showStorage ? usage : usage.slice(0, 1)" :total="100" class="size-28" />
		<figcaption>Compute 47 units · Storage 22 units · Capacity 100 units</figcaption>
		<label class="flex items-center gap-2">
			<input v-model="showStorage" type="checkbox" />
			Show storage in the chart
		</label>
	</figure>
</template>
