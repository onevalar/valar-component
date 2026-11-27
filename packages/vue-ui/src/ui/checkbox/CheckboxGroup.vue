<script setup lang="ts">
import type { ChangeDetails } from "@ui-sdk/core";
import { CheckboxGroup as SdkCheckboxGroup } from "@ui-sdk/vue/checkbox";
import type { CheckboxGroupController, CheckboxGroupState, CheckboxGroupValueChangeReason } from "@ui-sdk/vue/checkbox";
import { provide } from "vue";
import { valarCheckboxGroup } from "./group";

defineOptions({ inheritAttrs: false });
const props = defineProps<{
	modelValue?: string[];
	value?: string[];
	defaultValue?: string[];
	allValues?: string[];
	name?: string;
	form?: string;
	required?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	controller?: CheckboxGroupController;
}>();
const emit = defineEmits<{
	"update:modelValue": [value: string[]];
	"update:value": [value: string[]];
	valueChange: [value: string[], details: ChangeDetails<CheckboxGroupValueChangeReason>];
}>();
defineSlots<{ default?: (scope: { state: CheckboxGroupState }) => unknown }>();
provide(valarCheckboxGroup, true);
</script>

<template>
	<SdkCheckboxGroup
		v-bind="{ ...$attrs, ...props }"
		@update:model-value="emit('update:modelValue', $event)"
		@update:value="emit('update:value', $event)"
		@value-change="(value, details) => emit('valueChange', value, details)"
		v-slot="scope"
	>
		<slot v-bind="scope" />
	</SdkCheckboxGroup>
</template>
