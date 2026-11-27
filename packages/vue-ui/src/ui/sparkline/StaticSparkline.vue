<script setup lang="ts">
// Adapted from Valar's StaticSparkline, via TokenPlan c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4
// and the free Arc Sparkline. Copyright (c) 2026 Elia Kuratli; MIT (see LICENSE).
import { cn } from "cn";
import { computed, type SVGAttributes } from "vue";

export type StaticSparklineProps = {
	/** Ordered calendar slots: finite, nonnegative readings; null leaves a gap. */
	values: readonly (number | null)[];
	class?: SVGAttributes["class"];
	width?: SVGAttributes["width"];
	height?: SVGAttributes["height"];
	viewBox?: string;
};

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<StaticSparklineProps>(), {
	width: "50.4",
	height: "28",
	viewBox: "0 0 72 40",
});

const points = computed(() => {
	let maximum = 1;
	for (const value of props.values) {
		if (value !== null) maximum = Math.max(maximum, value);
	}
	const intervals = Math.max(1, props.values.length - 1);
	return props.values.map((value, index) =>
		value === null ? null : { x: 4 + (index / intervals) * 64, y: 36 - (value / maximum) * 32 }
	);
});
const path = computed(() =>
	points.value
		.map((point, index, slots) =>
			point ? `${slots[index - 1] ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}` : ""
		)
		.join(" ")
);
</script>

<template>
	<svg
		v-bind="$attrs"
		data-slot="static-sparkline"
		:viewBox="viewBox"
		:width="width"
		:height="height"
		aria-hidden="true"
		focusable="false"
		:class="cn('text-primary', props.class)"
	>
		<path
			:d="path"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<template v-for="(point, index) in points" :key="index">
			<circle
				v-if="point"
				:cx="point.x"
				:cy="point.y"
				:r="index === points.length - 1 || (!points[index - 1] && !points[index + 1]) ? 2 : 1.25"
				fill="currentColor"
			/>
		</template>
	</svg>
</template>
