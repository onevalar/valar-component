<script lang="ts">
// Ported from Valar's GaugeArc, adapted from the free Arc Gauge.
// Copyright (c) 2026 Elia Kuratli, MIT. See PROVENANCE.md.
import type { SVGAttributes } from "vue";

export type GaugeArcProps = {
	class?: SVGAttributes["class"];
	value: number | null;
	radius?: number;
	tone?: "accent" | "danger";
};

function arcFor(sweep: number, radius: number) {
	const start = -135;
	const end = start + 270 * sweep;
	const at = (angle: number) =>
		`${(50 + radius * Math.sin((angle * Math.PI) / 180)).toFixed(3)} ${(50 - radius * Math.cos((angle * Math.PI) / 180)).toFixed(3)}`;
	return `M ${at(start)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${at(end)}`;
}
</script>

<script setup lang="ts">
import { cn } from "cn";
import { computed } from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<GaugeArcProps>(), { radius: 42, tone: "accent" });
const missing = computed(() => props.value === null);
const percentage = computed(() =>
	props.value === null ? 0 : Math.min(1, Math.max(0, props.value / 100))
);
</script>

<template>
	<g
		data-slot="gauge-arc"
		:data-tone="tone"
		:data-missing="missing"
		:class="cn('fill-none stroke-9 [stroke-linecap:round]', props.class)"
		v-bind="$attrs"
	>
		<path
			:d="arcFor(1, radius)"
			class="stroke-border"
			:stroke-dasharray="missing ? '3 6' : undefined"
			:stroke-linecap="missing ? 'butt' : undefined"
		/>
		<path
			v-if="percentage > 0"
			:d="arcFor(percentage, radius)"
			:opacity="Math.min(1, percentage / 0.02)"
			:class="tone === 'danger' ? 'stroke-destructive' : 'stroke-primary'"
		/>
	</g>
</template>
