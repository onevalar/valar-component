<script lang="ts">
import { createSwitchController, switchPrimitive } from "@ui-sdk/core/switch";
import { createParts } from "@ui-sdk/vue/primitive";

const { Root: SwitchRoot } = createParts(switchPrimitive, { root: "button" });
</script>

<script setup lang="ts" generic="T = boolean">
import { SwitchThumb } from "@ui-sdk/vue/switch";
import { cn } from "cn";
import { computed, shallowRef, useAttrs } from "vue";
import type { Component, HTMLAttributes } from "vue";
import ToggleTrigger from "../../lib/ToggleTrigger";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
	id?: string;
	modelValue?: T | null;
	defaultValue?: T;
	trueValue?: T;
	falseValue?: T;
	name?: string;
	value?: string;
	form?: string;
	required?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	as?: string | Component;
	asChild?: boolean;
	class?: HTMLAttributes["class"];
	size?: "default" | "sm";
	appearance?: "default" | "settings";
}>(), { appearance: "default", size: "default", value: "on" });
const emit = defineEmits<{ "update:modelValue": [value: T] }>();
defineSlots<{ default?: (scope: { modelValue: T | null; checked: boolean }) => unknown }>();

const attrs = useAttrs();
const controller = createSwitchController();
const element = shallowRef<HTMLElement | null>(null);
defineExpose({ element, get $el() { return element.value; } });

const onValue = computed(() => props.trueValue === undefined ? true as T : props.trueValue);
const offValue = computed(() => props.falseValue === undefined ? false as T : props.falseValue);
const local = shallowRef(props.defaultValue ?? offValue.value);
const model = computed(() => props.modelValue === undefined ? local.value : props.modelValue);
const checked = computed(() => model.value === onValue.value);
const state = computed(() => checked.value ? "checked" : "unchecked");

function modelChange(next: boolean) {
	const value = next ? onValue.value : offValue.value;
	if (value === null) return;
	if (props.modelValue === undefined) local.value = value;
	emit("update:modelValue", value);
}

function activate(event: MouseEvent | KeyboardEvent) {
	if (element.value?.matches(":disabled")) return;
	controller.toggle({ reason: "press", event });
}

function keydown(event: KeyboardEvent) {
	if (event.key !== "Enter") return;
	event.preventDefault();
	activate(event);
}

function triggerProps(part: Record<string, unknown>) {
	const caller = attrs.onClick as ((event: MouseEvent) => void) | ((event: MouseEvent) => void)[] | undefined;
	const trigger = {
		...part,
		value: props.value,
		"data-state": state.value,
		type: attrs.type ?? part.type,
		tabindex: attrs.tabindex ?? attrs.tabIndex,
		onKeyup: attrs.onKeyup,
	};
	// Preserve legacy explicit submit/reset actions and the switch's own toggle
	// even if the caller cancels the native click's default action.
	if (!caller && attrs.type !== "submit" && attrs.type !== "reset" && !props.asChild) return trigger;
	return { ...trigger, onClick(event: MouseEvent) {
		if (Array.isArray(caller)) caller.forEach(listener => listener(event));
		else caller?.(event);
		activate(event);
	} };
}
</script>

<template>
	<SwitchRoot
		v-bind="$attrs"
		:id="id"
		:controller="controller"
		:checked="checked"
		:disabled="disabled"
		:required="required"
		:read-only="readOnly"
		data-slot="switch"
		:data-size="size"
		:data-appearance="appearance"
		:class="cn('cn-switch peer group/switch relative inline-flex items-center transition-[background-color,opacity] duration-150 ease-out outline-none after:absolute after:-inset-x-3 after:-inset-y-2 motion-reduce:transition-none data-disabled:cursor-not-allowed data-disabled:opacity-50', props.class)"
		@update:checked="modelChange"
		@keydown="keydown"
	>
		<template #render="{ props: part }">
			<ToggleTrigger :as="as" :as-child="asChild" :part="triggerProps(part)" :set-element="value => element = value">
				<slot :model-value="model" :checked="checked">
					<SwitchThumb v-if="!asChild && as !== 'template'" data-slot="switch-thumb" :data-state="state" class="cn-switch-thumb cn-switch-thumb-motion pointer-events-none block shrink-0 ring-0 duration-100 ease-out motion-reduce:transition-none" />
				</slot>
			</ToggleTrigger>
		</template>
	</SwitchRoot>
	<!-- Mirror the current state into the reset baseline, as before. -->
	<input v-if="name !== undefined" type="checkbox" :name="name" :form="form" :value="value" :checked="checked" :defaultChecked.prop="checked" :required="required" :disabled="disabled" aria-hidden="true" tabindex="-1" class="sr-only" @focus="controller.focus()" />
</template>
