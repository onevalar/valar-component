<script lang="ts">
import { checkbox } from "@ui-sdk/core/checkbox";
import { createParts } from "@ui-sdk/vue/primitive";

const { Root: StandaloneCheckbox } = createParts(checkbox, { root: "button" });
</script>

<script setup lang="ts" generic="T = boolean">
import { Checkbox as SdkCheckbox, CheckboxIndicator } from "@ui-sdk/vue/checkbox";
import type { CheckedState } from "@ui-sdk/vue/checkbox";
import { cn } from "cn";
import { computed, inject, shallowRef, useAttrs } from "vue";
import type { Component, HTMLAttributes } from "vue";
import Icon from "../../lib/Icon.vue";
import ToggleTrigger from "../../lib/ToggleTrigger";
import CheckboxInput from "./CheckboxInput.vue";
import { valarCheckboxGroup } from "./group";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
	id?: string;
	modelValue?: T | "indeterminate" | null;
	defaultValue?: T | "indeterminate";
	trueValue?: T;
	falseValue?: T;
	value?: string | number | bigint | boolean | object | null;
	name?: string;
	form?: string;
	required?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	parent?: boolean;
	as?: string | Component;
	asChild?: boolean;
	class?: HTMLAttributes["class"];
}>(), { value: "on" });
const emit = defineEmits<{ "update:modelValue": [value: T | "indeterminate"] }>();
defineSlots<{ default?: (scope: { modelValue: T | CheckedState | null; state: CheckedState }) => unknown }>();

// Standalone Valar retains its native form contract. In a Valar group, the SDK
// Checkbox must own the input so it can register with the official SDK group.
const grouped = inject(valarCheckboxGroup, false);
const root = grouped ? SdkCheckbox : StandaloneCheckbox;
const attrs = useAttrs();
const element = shallowRef<HTMLElement | null>(null);
defineExpose({ element, get $el() { return element.value; } });

const onValue = computed(() => props.trueValue === undefined ? true as T : props.trueValue);
const offValue = computed(() => props.falseValue === undefined ? false as T : props.falseValue);
const local = shallowRef<T | "indeterminate">(props.defaultValue ?? offValue.value);
const model = computed(() => props.modelValue === undefined ? local.value : props.modelValue);
const checked = computed<CheckedState>(() => model.value === "indeterminate" ? "indeterminate" : model.value === onValue.value);
const options = computed(() => grouped
	? { value: typeof props.value === "string" ? props.value : undefined, parent: props.parent, form: props.form }
	: { checked: checked.value });

const entries = computed(() => {
	const { name, value, required } = props;
	if (grouped || !name || (element.value && !element.value.closest("form"))) return [];
	if (Array.isArray(value) && (value.length || !required)) {
		return value.flatMap((item, index) => {
			const field = `${name}[${index}]`;
			return item !== null && typeof item === "object"
				? Object.entries(item).map(([key, value]) => ({ name: `${field}[${key}]`, value }))
				: [{ name: field, value: item }];
		});
	}
	if (value !== null && typeof value === "object" && !Array.isArray(value)) {
		return Object.entries(value).map(([key, value]) => ({ name: `${name}[${key}]`, value }));
	}
	return [{ name, value }];
});

function modelChange(next: CheckedState) {
	if (grouped) return;
	const value = next === "indeterminate" ? next : next ? onValue.value : offValue.value;
	if (props.modelValue === undefined) local.value = value;
	emit("update:modelValue", value);
}

function checkState(state: { checked: boolean; indeterminate: boolean }): CheckedState {
	return state.indeterminate ? "indeterminate" : state.checked;
}

function triggerProps(part: Record<string, unknown>, state: CheckedState) {
	return {
		...part,
		"data-state": dataState(state),
		// Standalone `form` only belongs to the visible button. A non-button keeps
		// its native Tab/Space behavior instead of becoming a new tab stop.
		...(grouped ? {} : { form: props.form, tabindex: attrs.tabindex ?? attrs.tabIndex, onKeyup: attrs.onKeyup }),
	};
}

function dataState(state: CheckedState) {
	return state === "indeterminate" ? state : state ? "checked" : "unchecked";
}
</script>

<template>
	<component
		:is="root"
		v-bind="{ ...$attrs, ...options }"
		:id="id"
		:disabled="disabled"
		:required="required"
		:read-only="readOnly"
		data-slot="checkbox"
		:class="
			cn(
				'cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50',
				props.class
			)
		"
		@update:checked="modelChange"
		@keydown.enter.prevent
	>
		<template #render="{ props: part, state }">
			<ToggleTrigger
				:as="as"
				:as-child="asChild"
				:part="triggerProps(part, checkState(state))"
				:set-element="value => element = value"
			>
				<slot v-if="asChild || as === 'template'" :model-value="grouped ? checkState(state) : model" :state="checkState(state)" />
				<CheckboxIndicator
					v-else-if="checkState(state) !== false"
					data-slot="checkbox-indicator"
					:data-state="dataState(checkState(state))"
					class="cn-checkbox-indicator grid place-content-center text-current transition-none"
					style="pointer-events: none"
				>
					<slot :model-value="grouped ? checkState(state) : model" :state="checkState(state)">
						<Icon lucide="CheckIcon" />
					</slot>
				</CheckboxIndicator>
			</ToggleTrigger>
		</template>
	</component>
	<CheckboxInput
		v-for="entry in entries"
		:key="entry.name"
		v-bind="entry"
		:checked="checked !== false"
		:required="required"
		:disabled="disabled"
	/>
</template>
