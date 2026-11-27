<script setup lang="ts">
import { RadioGroup as SdkRadioGroup } from "@ui-sdk/vue/radio";
import { cn } from "cn";
import { shallowRef, type Component, type ComponentPublicInstance, type HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
	defineProps<{
		modelValue?: string;
		defaultValue?: string;
		name?: string;
		form?: string;
		required?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		loop?: boolean;
		dir?: "ltr" | "rtl";
		orientation?: "horizontal" | "vertical";
		as?: string | Component;
		class?: HTMLAttributes["class"];
	}>(),
	{ orientation: "vertical", loop: true, as: "div" }
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const element = shallowRef<HTMLElement | null>(null);
defineExpose({
	get $el() {
		return element.value;
	},
});

function rootProps(part: Record<string, unknown>) {
	return {
		...part,
		ref: (node: Element | ComponentPublicInstance | null) => {
			(part.ref as ((node: unknown) => void) | undefined)?.(node);
			const root = node && "$el" in node ? node.$el : node;
			element.value = root instanceof HTMLElement ? root : null;
		},
	};
}
</script>

<template>
	<SdkRadioGroup
		v-bind="$attrs"
		:model-value="modelValue"
		:default-value="defaultValue"
		:name="name || undefined"
		:form="form"
		:required="Boolean(name) && required"
		:disabled="disabled"
		:read-only="readonly"
		:loop="loop"
		:dir="dir"
		:aria-required="required || undefined"
		:aria-orientation="orientation"
		:data-orientation="orientation"
		:class="cn('cn-radio-group w-full', props.class)"
		@update:model-value="(value) => emit('update:modelValue', value ?? '')"
	>
		<template #render="{ props: part, state }">
			<component :is="as" v-bind="rootProps(part)" data-slot="radio-group">
				<slot :model-value="state.value ?? undefined" />
			</component>
		</template>
	</SdkRadioGroup>
</template>
