<script setup lang="ts" generic="T extends 'single' | 'multiple' = 'multiple'">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, useForwardProps } from "reka-ui";
import { computed, ref, useAttrs } from "vue";
import SliderSurface from "./SliderSurface.vue";
import { scalarKeyValue } from "./scalar-keyboard";
import type { SliderRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

type Model = T extends "single" ? number : number[];
type UpdateModel = T extends "single" ? number : number[] | undefined;
const props = defineProps<
	Omit<SliderRootProps, "modelValue" | "defaultValue"> & {
		type?: T;
		modelValue?: Model | null;
		defaultValue?: Model;
		largeStep?: number;
		thumbLabels?: string[];
		class?: HTMLAttributes["class"];
	}
>();
const emits = defineEmits<{
	"update:modelValue": [value: UpdateModel];
	valueCommit: [value: Model];
}>();
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const delegatedProps = reactiveOmit(
	props,
	"class",
	"type",
	"modelValue",
	"defaultValue",
	"largeStep",
	"thumbLabels",
	"as",
	"asChild"
);
const forwarded =
	useForwardProps<Omit<SliderRootProps, "modelValue" | "defaultValue" | "as" | "asChild">>(
		delegatedProps
	);
const scalar = computed(() => props.type === "single");
const local = ref<number | number[]>(props.defaultValue ?? (scalar.value ? (props.min ?? 0) : [0]));
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value));
const arrayValue = computed<number[] | null>(() => {
	const current: number | number[] | null = value.value;
	return typeof current === "number" ? [current] : current;
});
function update(next: number[] | undefined) {
	if (!next) {
		if (!scalar.value) emits("update:modelValue", next as UpdateModel);
		return;
	}
	const publicValue = (scalar.value ? next[0] : next) as Model;
	local.value = publicValue;
	emits("update:modelValue", publicValue as UpdateModel);
}
function commit(next: number[]) {
	emits("valueCommit", (scalar.value ? next[0] : next) as Model);
}
function keyboard(event: KeyboardEvent) {
	if (props.disabled || typeof value.value !== "number") return;
	const next = scalarKeyValue(
		event,
		value.value,
		props.min,
		props.max,
		props.step,
		props.largeStep
	);
	if (next === undefined) return;
	event.preventDefault();
	if (Object.is(next, value.value)) return;
	update([next]);
	commit([next]);
}
function rootAttrs() {
	const {
		onKeydown: _keydown,
		"aria-label": _label,
		"aria-labelledby": _labelledby,
		"aria-valuetext": _valueText,
		...rest
	} = attrs;
	return rest;
}
const userKeydown = computed(() => attrs.onKeydown as ((event: KeyboardEvent) => void) | undefined);
</script>

<template>
	<SliderRoot
		v-slot="{ modelValue }"
		data-slot="slider"
		:class="
			cn(
				'cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col',
				props.class
			)
		"
		v-bind="{ ...rootAttrs(), ...forwarded }"
		:model-value="arrayValue"
		as-child
		@update:model-value="update"
		@value-commit="commit"
	>
		<SliderSurface
			:as="props.as"
			:as-child="props.asChild"
			:scalar="scalar"
			:keyboard="keyboard"
			:user-keydown="userKeydown"
		>
			<SliderTrack
				data-slot="slider-track"
				class="cn-slider-track relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full"
			>
				<SliderRange
					data-slot="slider-range"
					class="cn-slider-range absolute select-none data-horizontal:h-full data-vertical:w-full"
				/>
			</SliderTrack>

			<SliderThumb
				v-for="(_, key) in modelValue"
				:key="key"
				data-slot="slider-thumb"
				:aria-label="thumbLabels?.[key] ?? (attrs['aria-label'] as string | undefined)"
				:aria-labelledby="attrs['aria-labelledby'] as string | undefined"
				:aria-valuetext="attrs['aria-valuetext'] as string | undefined"
				class="cn-slider-thumb block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"
			/>
		</SliderSurface>
	</SliderRoot>
</template>
