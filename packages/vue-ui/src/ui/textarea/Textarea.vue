<script setup lang="ts">
import { cn } from "cn";
import { computed, ref, type HTMLAttributes } from "vue";
import { useFormReset } from "../../lib/use-form-reset";

const props = withDefaults(defineProps<{
	defaultValue?: string;
	modelValue?: string;
	class?: HTMLAttributes["class"];
	appearance?: "default" | "settings";
}>(), { appearance: "default" });
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const initialValue = props.defaultValue ?? "";
const localValue = ref(initialValue);
const model = computed({
	get: () => props.modelValue ?? localValue.value,
	set: value => {
		if (props.modelValue === undefined) localValue.value = value;
		emit("update:modelValue", value);
	},
});
const textarea = ref<HTMLTextAreaElement | null>(null);
useFormReset(textarea, control => {
	if (props.modelValue === undefined && model.value !== initialValue) model.value = initialValue;
	control.value = model.value;
});
</script>

<template>
	<textarea
		ref="textarea"
		v-model="model"
		data-slot="textarea"
		:data-appearance="appearance"
		:class="cn('cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', appearance === 'settings' && 'cn-textarea-appearance-settings', props.class)"
	/>
</template>
