<script lang="ts">
// Ported from Valar's WaffleChart, adapted from the free Arc WaffleChart.
// Copyright (c) 2026 Elia Kuratli, MIT. See PROVENANCE.md.
import type { HTMLAttributes } from "vue";

export type WaffleCategory = { key: string; value: number; color: string };
export type WaffleChartProps = {
	class?: HTMLAttributes["class"];
	data: readonly WaffleCategory[];
	label: string;
};

function allocate(data: readonly WaffleCategory[]) {
	let weights = data.map(({ value }) => Math.max(0, value));
	let total = weights.reduce((sum, weight) => sum + weight, 0);
	if (total <= 0) return weights;
	if (total === Infinity) {
		// A sum of finite inputs may overflow. Scaling keeps the same proportions.
		const max = weights.reduce((largest, weight) => Math.max(largest, weight), 0);
		weights = weights.map((weight) => weight / max);
		total = weights.reduce((sum, weight) => sum + weight, 0);
	}
	const exact = weights.map((weight) => (weight / total) * 100);
	const counts = exact.map(Math.floor);
	const left = 100 - counts.reduce((sum, count) => sum + count, 0);
	const order = exact
		.map((value, index) => ({ index, remainder: value - counts[index] }))
		.sort((a, b) => b.remainder - a.remainder);
	for (let k = 0; k < left && k < order.length; k++) counts[order[k].index]++;
	return counts;
}
</script>

<script setup lang="ts">
import { cn } from "cn";
import { computed } from "vue";

defineOptions({ inheritAttrs: false });
const props = defineProps<WaffleChartProps>();
const cells = computed(() => {
	const counts = allocate(props.data);
	return props.data.flatMap((item, index) => Array.from({ length: counts[index] }, () => item));
});
</script>

<template>
	<div
		data-slot="waffle-chart"
		role="img"
		:aria-label="label"
		:class="cn('grid aspect-square w-full grid-cols-10 grid-rows-10 gap-[3px]', props.class)"
		v-bind="$attrs"
	>
		<span
			v-for="(cell, index) in cells"
			:key="index"
			aria-hidden="true"
			:data-category="cell.key"
			class="min-h-0 min-w-0 rounded-[22%]"
			:style="{
				gridColumn: Math.floor(index / 10) + 1,
				gridRow: 10 - (index % 10),
				background: cell.color,
			}"
		/>
	</div>
</template>
