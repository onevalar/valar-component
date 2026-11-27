<script lang="ts">
import GaugeArc, { type GaugeArcProps } from "./GaugeArc.vue";
// Ported from Valar's Gauge, adapted from the free Arc Gauge.
// Copyright (c) 2026 Elia Kuratli, MIT. See PROVENANCE.md.
import type { HTMLAttributes } from "vue";

export type GaugeProps = {
	class?: HTMLAttributes["class"];
	value: number;
	label: string;
	valueText: string;
	tone?: GaugeArcProps["tone"];
};
</script>

<script setup lang="ts">
import { cn } from "cn";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<GaugeProps>(), { tone: "accent" });
</script>

<template>
	<div
		data-slot="gauge"
		:data-tone="tone"
		role="meter"
		:aria-label="label"
		:aria-valuemin="0"
		:aria-valuemax="100"
		:aria-valuenow="Math.min(100, Math.max(0, value))"
		:aria-valuetext="valueText"
		:class="cn('relative aspect-[100/90] w-full', props.class)"
		v-bind="$attrs"
	>
		<svg
			viewBox="0 0 100 90"
			aria-hidden="true"
			focusable="false"
			class="block size-full overflow-visible"
		>
			<GaugeArc :value="value" :tone="tone" />
		</svg>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 grid aspect-square place-content-center"
		>
			<span
				:class="
					cn(
						'text-xl font-semibold tracking-tight tabular-nums',
						tone === 'danger' ? 'text-destructive' : 'text-foreground'
					)
				"
				>{{ Math.round(value) }}<span class="ms-px text-[0.5em]">%</span></span
			>
		</div>
	</div>
</template>
