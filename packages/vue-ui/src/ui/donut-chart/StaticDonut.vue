<script lang="ts">
// Ported from Valar's StaticDonut, adapted from the free Arc DonutChart.
// Copyright (c) 2026 Elia Kuratli, MIT. See PROVENANCE.md.
export type DonutPart = { key: string; value: number; color: string };
export type StaticDonutProps = {
	parts: readonly DonutPart[];
	total: number;
};

function sector(start: number, end: number) {
	const turns = end - start;
	if (turns <= 0) return "";
	const outer = 97;
	const inner = 73;
	const coordinate = (value: number) => Math.round(value * 1e6) / 1e6;
	const at = (radius: number, angle: number) =>
		`${coordinate(104 + radius * Math.cos(angle))} ${coordinate(104 + radius * Math.sin(angle))}`;
	if (turns >= 1) {
		const top = -Math.PI / 2;
		const bottom = Math.PI / 2;
		return `M${at(outer, top)}A97 97 0 1 1 ${at(outer, bottom)}A97 97 0 1 1 ${at(outer, top)}ZM${at(inner, top)}A73 73 0 1 0 ${at(inner, bottom)}A73 73 0 1 0 ${at(inner, top)}Z`;
	}
	const a0 = start * Math.PI * 2 - Math.PI / 2;
	const a1 = end * Math.PI * 2 - Math.PI / 2;
	const largeArc = a1 - a0 > Math.PI ? 1 : 0;
	return `M${at(outer, a0)}A97 97 0 ${largeArc} 1 ${at(outer, a1)}L${at(inner, a1)}A73 73 0 ${largeArc} 0 ${at(inner, a0)}Z`;
}
</script>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ inheritAttrs: false });
const props = defineProps<StaticDonutProps>();
const slices = computed(() => {
	let used = 0;
	return props.parts.map((part) => {
		const start = used / props.total;
		used += part.value;
		return { ...part, start, end: used / props.total };
	});
});
</script>

<template>
	<svg
		data-slot="static-donut"
		viewBox="0 0 208 208"
		aria-hidden="true"
		focusable="false"
		v-bind="$attrs"
	>
		<path
			v-for="part in slices"
			:key="part.key"
			:data-part="part.key"
			:data-start="part.start"
			:data-end="part.end"
			:data-value="part.value"
			:d="sector(part.start, part.end)"
			:fill="part.color"
		/>
	</svg>
</template>
