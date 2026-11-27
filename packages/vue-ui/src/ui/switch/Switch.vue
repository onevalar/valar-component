<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { SwitchRoot, SwitchThumb, useForwardExpose, useForwardProps } from "reka-ui";
import type { SwitchRootEmits, SwitchRootProps } from "reka-ui";
import { computed, ref, type HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SwitchRootProps & {
	class?: HTMLAttributes["class"];
	size?: "default" | "sm";
	appearance?: "default" | "settings";
	form?: string;
}>(), { appearance: "default", size: "default", value: "on", trueValue: true, falseValue: false, modelValue: undefined });
const emit = defineEmits<SwitchRootEmits>();
const forwarded = useForwardProps(reactiveOmit(props, "class", "appearance", "size", "form", "name", "modelValue", "defaultValue"));
const { forwardRef, currentElement } = useForwardExpose();
const localValue = ref(props.defaultValue ?? props.falseValue);
const model = computed({
	get: () => props.modelValue === undefined ? localValue.value : props.modelValue,
	set: value => {
		if (props.modelValue === undefined && value !== null) localValue.value = value;
		if (value !== null) emit("update:modelValue", value);
	},
});
</script>

<template>
	<SwitchRoot
		:ref="forwardRef"
		v-bind="{ ...$attrs, ...forwarded }"
		v-model="model"
		data-slot="switch"
		:data-size="size"
		:data-appearance="appearance"
		:class="cn('cn-switch peer group/switch relative inline-flex items-center transition-[background-color,opacity] duration-150 ease-out outline-none after:absolute after:-inset-x-3 after:-inset-y-2 motion-reduce:transition-none data-disabled:cursor-not-allowed data-disabled:opacity-50', props.class)"
		v-slot="state"
	>
		<slot v-bind="state"><SwitchThumb data-slot="switch-thumb" class="cn-switch-thumb cn-switch-thumb-motion pointer-events-none block shrink-0 ring-0 duration-100 ease-out motion-reduce:transition-none" /></slot>
	</SwitchRoot>
	<!-- Reka 2.10.5's checkbox bridge replaces the submitted value with checked.
		Use a native checkbox with a declared value and mirror the state into the reset baseline. -->
	<input v-if="name !== undefined" type="checkbox" :name="name" :form="form" :value="value" :checked="model === trueValue" :defaultChecked.prop="model === trueValue" :required="required" :disabled="disabled" aria-hidden="true" tabindex="-1" class="sr-only" @focus="currentElement?.focus()" />
</template>
