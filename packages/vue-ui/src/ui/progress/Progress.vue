<script setup lang="ts">
import { cn } from "cn";
import { computed } from "vue";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		appearance?: "default" | "project";
		min?: number;
		max?: number;
		value?: number | null;
	}>(),
	{ appearance: "default", min: 0, max: 100, value: 0 }
);

const currentValue = computed(() =>
	props.value === null ? null : Math.min(props.max, Math.max(props.min, props.value))
);
const fraction = computed(() =>
	currentValue.value !== null && props.max > props.min
		? (currentValue.value - props.min) / (props.max - props.min)
		: 0
);
const state = computed(() =>
	currentValue.value === null
		? "indeterminate"
		: currentValue.value === props.max
			? "loaded"
			: "loading"
);
</script>

<template>
	<div
		role="progressbar"
		data-slot="progress"
		:data-appearance="appearance === 'project' ? 'project' : undefined"
		:data-state="state"
		:data-min="min"
		:data-max="max"
		:data-value="currentValue ?? undefined"
		:data-indeterminate="currentValue === null ? '' : undefined"
		:aria-valuemin="min"
		:aria-valuemax="max"
		:aria-valuenow="currentValue ?? undefined"
		:class="
			cn(
				'cn-progress relative flex w-full items-center overflow-x-hidden',
				appearance === 'project' && 'cn-progress-project',
				props.class
			)
		"
	>
		<span v-if="appearance === 'project'" aria-hidden="true">{{
			currentValue === null ? "—" : `${Math.round(fraction * 100)}%`
		}}</span>
		<div
			v-else
			data-slot="progress-indicator"
			:data-indeterminate="currentValue === null ? '' : undefined"
			class="cn-progress-indicator h-full shrink-0 rounded-[inherit] transition-[width] duration-150 data-indeterminate:mx-auto motion-safe:data-indeterminate:animate-pulse motion-reduce:transition-none"
			:style="{ width: currentValue === null ? '35%' : `${fraction * 100}%` }"
		/>
	</div>
</template>
