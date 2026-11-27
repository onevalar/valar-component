<script setup lang="ts">
import { cn } from "cn";
import { RadioGroupRoot, useForwardExpose } from "reka-ui";
import type { AcceptableValue, RadioGroupRootProps } from "reka-ui";
import { computed, provide, type HTMLAttributes } from "vue";
import { radioGroupReadonly } from "./context";

defineOptions({ inheritAttrs: false });
const props = defineProps<Omit<RadioGroupRootProps, "modelValue" | "defaultValue"> & {
	modelValue?: string;
	defaultValue?: string;
	class?: HTMLAttributes["class"];
	readonly?: boolean;
	loop?: boolean;
	autocomplete?: string;
	form?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const { forwardRef, currentElement } = useForwardExpose();
provide(radioGroupReadonly, computed(() => props.readonly ?? false));

function update(value: AcceptableValue) {
	if (typeof value === "string") emit("update:modelValue", value);
}

function focusRadio() {
	const root = currentElement.value;
	const radio = root?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')
		?? root?.querySelector<HTMLElement>('[role="radio"]:not(:disabled)');
	radio?.focus();
}
</script>

<template>
	<RadioGroupRoot :ref="forwardRef" v-slot="state" v-bind="$attrs" data-slot="radio-group"
		:as="as" :as-child="asChild" :model-value="modelValue" :default-value="defaultValue"
		:disabled="disabled" :required="required" :dir="dir" :loop="props.loop ?? true" :orientation="orientation ?? 'vertical'"
		:aria-readonly="readonly || undefined" :aria-disabled="disabled || undefined" :data-readonly="readonly ? '' : undefined"
		:class="cn('cn-radio-group w-full', props.class)" @update:model-value="update">
		<slot v-bind="state" />
		<!-- A text input matches the Svelte bridge: no value fails required validation.
			Its reset baseline tracks the current selected value, including the empty value. -->
		<input v-if="name !== undefined" type="text" :name="name" :form="form"
			:value="state.modelValue ?? ''" :defaultValue.prop="String(state.modelValue ?? '')" :autocomplete="autocomplete ?? 'off'"
			:required="required" :disabled="disabled" aria-hidden="true" tabindex="-1" class="sr-only" @focus="focusRadio" />
	</RadioGroupRoot>
</template>
