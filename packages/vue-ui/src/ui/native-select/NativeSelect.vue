<script setup lang="ts" generic="T extends NativeSelectValue = string">
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import { computed, onMounted, onUpdated, provide, watch, type HTMLAttributes } from "vue";
import Icon from "../../lib/Icon.vue";
import { useFormReset } from "../../lib/use-form-reset";
import { initialSelection, type NativeSelectValue } from "./context";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
	class?: HTMLAttributes["class"];
	size?: "default" | "sm";
	modelValue?: T;
	defaultValue?: T;
	multiple?: boolean;
}>(), { size: "default" });
const emit = defineEmits<{ "update:modelValue": [value: T] }>();
const { forwardRef, currentRef } = useForwardExpose();
const initialValue = props.modelValue ?? props.defaultValue;
let localValue: NativeSelectValue | undefined = props.defaultValue;
provide(initialSelection, initialValue);

function syncSelection() {
	const select = currentRef.value;
	const model = props.modelValue ?? localValue;
	if (!(select instanceof HTMLSelectElement) || model === undefined) return;
	if (select.multiple) {
		const selected = new Set(Array.isArray(model) ? model : [model]);
		for (const option of select.options) option.selected = selected.has(option.value);
	} else {
		select.value = Array.isArray(model) ? model[0] ?? "" : model;
	}
}

function readSelection(select: HTMLSelectElement): NativeSelectValue {
	return select.multiple ? [...select.selectedOptions].map(option => option.value) : select.value;
}

function change(event: Event) {
	if (!(event.currentTarget instanceof HTMLSelectElement)) return;
	const value = readSelection(event.currentTarget);
	if (props.modelValue === undefined) localValue = value;
	// The native `multiple` attribute determines the model shape.
	emit("update:modelValue", value as T);
}

onMounted(syncSelection);
onUpdated(syncSelection);
watch(() => props.modelValue, syncSelection, { deep: true, flush: "post" });
const selectElement = computed(() => currentRef.value as HTMLSelectElement | null | undefined);
useFormReset(selectElement, select => {
	if (props.modelValue !== undefined) {
		syncSelection();
		return;
	}
	const previous = localValue;
	localValue = initialValue;
	syncSelection();
	const value = readSelection(select);
	if (previous !== undefined && (Array.isArray(previous) && Array.isArray(value)
		? previous.length !== value.length || previous.some((option, index) => option !== value[index])
		: previous !== value)) emit("update:modelValue", value as T);
});
</script>

<template>
	<div data-slot="native-select-wrapper" :data-size="size" :class="cn('group/native-select relative w-fit has-[select:disabled]:opacity-50', props.class)">
		<select :ref="forwardRef" :multiple="multiple" data-slot="native-select" :data-size="size" class="cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed"
			@change="change" v-bind="$attrs"><slot /></select>
		<Icon lucide="ChevronDownIcon" data-slot="native-select-icon" class="cn-native-select-icon pointer-events-none absolute select-none" />
	</div>
</template>
