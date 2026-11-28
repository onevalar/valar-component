<script setup lang="ts">
import { Menubar as SdkMenubar, type MenubarOrientation } from "@ui-sdk/vue/menubar";
import { cn } from "cn";
import { computed, provide, ref, type HTMLAttributes } from "vue";
import { MENUBAR_VALUE_KEY } from "./context";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		modelValue?: string;
		value?: string;
		defaultValue?: string;
		orientation?: MenubarOrientation;
		loop?: boolean;
		disabled?: boolean;
		modal?: boolean | "pointer";
		dir?: "ltr" | "rtl";
		class?: HTMLAttributes["class"];
	}>(),
	{
		modelValue: undefined,
		value: undefined,
		loop: undefined,
		disabled: undefined,
		modal: undefined,
	}
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const local = ref(props.defaultValue ?? "");
const isControlled = computed(() => props.modelValue !== undefined || props.value !== undefined);
const currentValue = computed(() => props.modelValue ?? props.value ?? local.value);

provide(MENUBAR_VALUE_KEY, {
	value: currentValue,
	isControlled,
	onMenuOpenChange(menuValue, nextOpen) {
		if (nextOpen) {
			if (!isControlled.value) local.value = menuValue;
			if (currentValue.value !== menuValue) emit("update:modelValue", menuValue);
		} else if (currentValue.value === menuValue) {
			if (!isControlled.value) local.value = "";
			emit("update:modelValue", "");
		}
	},
});
</script>

<template>
	<SdkMenubar
		v-bind="$attrs"
		:orientation="props.orientation"
		:loop="props.loop"
		:disabled="props.disabled"
		:modal="props.modal"
		:class="cn('cn-menubar flex items-center', props.class)"
	>
		<template #render="{ props: part }">
			<div v-bind="part" data-slot="menubar">
				<slot :model-value="currentValue" />
			</div>
		</template>
	</SdkMenubar>
</template>
