<script setup lang="ts">
import { Textarea as SdkTextarea } from "@ui-sdk/vue/textarea";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		defaultValue?: string;
		modelValue?: string;
		class?: HTMLAttributes["class"];
		appearance?: "default" | "settings";
	}>(),
	{ appearance: "default" }
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
	<SdkTextarea
		:model-value="modelValue"
		:default-value="modelValue ?? defaultValue"
		:auto-resize="appearance === 'default'"
		@update:model-value="emit('update:modelValue', $event)"
		data-slot="textarea"
		:data-appearance="appearance"
		:class="
			cn(
				'cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
				appearance === 'settings' && 'cn-textarea-appearance-settings',
				props.class
			)
		"
	/>
</template>
