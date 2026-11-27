<script lang="ts">
const ticks = Array.from({ length: 60 }, (_, index) => {
	const angle = ((index * 6 - 90) * Math.PI) / 180;
	return {
		x1: 50 + 36 * Math.cos(angle),
		y1: 50 + 36 * Math.sin(angle),
		x2: 50 + 44 * Math.cos(angle),
		y2: 50 + 44 * Math.sin(angle),
	};
});
</script>

<script setup lang="ts">
// Independently authored for Valar (MIT); no Arc/Arc Pro source. See PROVENANCE.md.
import { cn } from "cn";
import { computed, type HTMLAttributes } from "vue";

export type TickMeterProps = {
	/** Finite percentage. The geometry and ARIA value clamp; the visible readout does not. */
	value: number;
	label: string;
	valueText: string;
	tone?: "accent" | "danger";
	class?: HTMLAttributes["class"];
};

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<TickMeterProps>(), { tone: "accent" });
const bounded = computed(() => Math.min(100, Math.max(0, props.value)));
const filled = computed(() => Math.round((bounded.value * 60) / 100));
const filledClass = computed(() =>
	props.tone === "danger" ? "stroke-destructive" : "stroke-primary"
);
</script>

<template>
	<div
		v-bind="$attrs"
		data-slot="tick-meter"
		:data-tone="tone"
		role="meter"
		:aria-label="label"
		:aria-valuemin="0"
		:aria-valuemax="100"
		:aria-valuenow="bounded"
		:aria-valuetext="valueText"
		:class="cn('relative aspect-square w-full', props.class)"
	>
		<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" class="block size-full">
			<line
				v-for="(tick, index) in ticks"
				:key="index"
				v-bind="tick"
				:data-filled="index < filled"
				stroke-width="2.5"
				stroke-linecap="round"
				:class="index < filled ? filledClass : 'stroke-border'"
			/>
		</svg>
		<span
			aria-hidden="true"
			:class="
				cn(
					'pointer-events-none absolute inset-0 grid place-content-center text-xl font-semibold tracking-tight tabular-nums',
					tone === 'danger' ? 'text-destructive' : 'text-foreground'
				)
			"
		>
			{{ Math.round(value) }}%
		</span>
	</div>
</template>
