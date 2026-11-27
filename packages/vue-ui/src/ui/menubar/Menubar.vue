<script setup lang="ts">
import { MenubarRoot, useForwardExpose, useForwardProps } from "reka-ui";
import type { MenubarRootProps } from "reka-ui";

const props = defineProps<MenubarRootProps>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const forwarded = useForwardProps(props);
const { forwardRef } = useForwardExpose();

// Reka 2.10.5 declares boolean here, but its model and runtime payload are strings.
function onChange(value: unknown) {
	if (typeof value === "string") emit("update:modelValue", value);
}
</script>

<template>
	<MenubarRoot
		:ref="forwardRef"
		v-slot="slotProps"
		v-bind="forwarded"
		data-slot="menubar"
		class="cn-menubar flex items-center"
		@update:model-value="onChange"
	>
		<slot v-bind="slotProps" />
	</MenubarRoot>
</template>
