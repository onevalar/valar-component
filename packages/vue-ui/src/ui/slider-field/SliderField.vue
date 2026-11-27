<script lang="ts">
import type { HTMLAttributes } from "vue";

export interface SliderFieldProps {
	/** Visible label; also names the slider and the number input. */
	label: string;
	modelValue?: number;
	defaultValue?: number;
	min?: number;
	max?: number;
	step?: number;
	/** Shown after the number, e.g. "px". Not part of the value. */
	unit?: string;
	disabled?: boolean;
	name?: string;
	id?: string;
	class?: HTMLAttributes["class"];
}
</script>

<script setup lang="ts">
import { cn } from "cn";
import { computed, ref, useId } from "vue";
import { NumberField } from "../number-field";
import { Slider } from "../slider";

const props = withDefaults(defineProps<SliderFieldProps>(), {
	defaultValue: 0,
	min: 0,
	max: 100,
	step: 1,
});
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const generatedId = useId();
const inputId = computed(() => `${props.id ?? generatedId}-input`);
const local = ref(props.defaultValue);
const value = computed(() => props.modelValue ?? local.value);

function change(next: number | undefined) {
	// Reject draft candidates without moving the slider or changing its submitted value.
	if (
		next === undefined ||
		!Number.isFinite(next) ||
		next < props.min ||
		next > props.max ||
		Object.is(next, value.value)
	)
		return;
	if (props.modelValue === undefined) local.value = next;
	emit("update:modelValue", next);
}
</script>

<template>
	<div
		:id="id"
		data-slot="slider-field"
		:data-disabled="disabled || undefined"
		:class="cn('grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2', props.class)"
	>
		<label
			:for="inputId"
			class="col-span-2 text-[13px] leading-[17px] font-medium text-foreground"
			>{{ label }}</label
		>
		<Slider
			type="single"
			:model-value="value"
			:min="min"
			:max="max"
			:step="step"
			:disabled="disabled"
			:aria-label="label"
			@update:model-value="change"
		/>
		<div class="flex items-center gap-1.5">
			<NumberField
				:id="inputId"
				:name="name"
				:model-value="value"
				:min="min"
				:max="max"
				:step="step"
				:disabled="disabled"
				:decrement-label="`减小${label}`"
				:increment-label="`增大${label}`"
				class="w-32"
				@update:model-value="change"
			/>
			<span v-if="unit" class="text-xs text-muted-foreground tabular-nums">{{ unit }}</span>
		</div>
	</div>
</template>
