<script setup lang="ts">
import { DropdownMenuGroup, useForwardExpose } from "reka-ui";
import { computed, provide, ref } from "vue";
import { checkboxGroupKey } from "./parts.js";
import type { DropdownMenuGroupProps } from "reka-ui";

const props = defineProps<
	DropdownMenuGroupProps & { modelValue?: string[]; defaultValue?: string[] }
>();
const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();
const local = ref(props.defaultValue ?? []);
const values = computed(() => props.modelValue ?? local.value);
const { forwardRef } = useForwardExpose();

provide(checkboxGroupKey, {
	values,
	set(value, checked) {
		if (values.value.includes(value) === checked) return;
		const next = checked ? [...values.value, value] : values.value.filter((item) => item !== value);
		local.value = next;
		emit("update:modelValue", next);
	},
});
</script>

<template>
	<DropdownMenuGroup
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		data-slot="dropdown-menu-checkbox-group"
	>
		<slot :model-value="values" />
	</DropdownMenuGroup>
</template>
