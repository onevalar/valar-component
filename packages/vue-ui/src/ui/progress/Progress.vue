<script setup lang="ts">
import { Progress as SdkProgress, ProgressIndicator, ProgressValue } from "@ui-sdk/vue/progress";
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

const lower = computed(() => (Number.isFinite(props.min) ? props.min : 0));
const upper = computed(() => Math.max(lower.value, Number.isFinite(props.max) ? props.max : 100));
const currentValue = computed(() =>
	props.value === null
		? null
		: Math.min(
				upper.value,
				Math.max(lower.value, Number.isNaN(props.value) ? lower.value : props.value)
			)
);
const state = computed(() =>
	currentValue.value === null
		? "indeterminate"
		: currentValue.value === upper.value
			? "loaded"
			: "loading"
);
</script>

<template>
	<SdkProgress
		:min="lower"
		:max="upper"
		:value="currentValue"
		:get-value-label="upper === lower && currentValue !== null ? () => '0%' : undefined"
		data-slot="progress"
		:data-appearance="appearance === 'project' ? 'project' : undefined"
		:data-state="state"
		:data-min="lower"
		:data-max="upper"
		:data-value="currentValue ?? undefined"
		:class="
			cn(
				'cn-progress relative flex w-full items-center overflow-x-hidden',
				appearance === 'project' && 'cn-progress-project',
				props.class
			)
		"
	>
		<ProgressValue
			v-if="appearance === 'project'"
			v-slot="{ state: { percent } }"
			aria-hidden="true"
			>{{ percent === null ? "—" : `${upper === lower ? 0 : Math.round(percent)}%` }}</ProgressValue
		>
		<ProgressIndicator
			v-else
			data-slot="progress-indicator"
			:class="
				cn(
					'cn-progress-indicator h-full shrink-0 rounded-[inherit] transition-[width] duration-150 data-indeterminate:mx-auto motion-safe:data-indeterminate:animate-pulse motion-reduce:transition-none',
					upper === lower && currentValue !== null && 'w-0!'
				)
			"
			:style="currentValue === null ? { width: '35%' } : undefined"
		/>
	</SdkProgress>
</template>
