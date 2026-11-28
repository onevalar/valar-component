<script setup lang="ts">
import { Input as SdkInput } from "@ui-sdk/vue/input";
import { useVModel } from "@vueuse/core";
import { cn } from "cn";
import { computed, useAttrs, type HTMLAttributes } from "vue";

const props = defineProps<{
	defaultValue?: string | number;
	modelValue?: string | number;
	type?: string;
	class?: HTMLAttributes["class"];
}>();

const emits = defineEmits<{
	(e: "update:modelValue", payload: string | number): void;
}>();

const attrs = useAttrs();
const slot = computed(() => (attrs["data-slot"] as string | undefined) ?? "input");
const modelValue = useVModel(props, "modelValue", emits, {
	passive: true,
	defaultValue: props.defaultValue,
});
const classes = () =>
	cn(
		"cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
		props.class
	);
</script>

<template>
	<SdkInput
		v-if="!type || /^(text|search|email|tel|url|password)$/i.test(type)"
		:type="type"
		:model-value="props.modelValue === undefined ? undefined : String(props.modelValue)"
		:default-value="props.defaultValue === undefined ? undefined : String(props.defaultValue)"
		:data-slot="slot"
		:class="classes()"
		@update:model-value="emits('update:modelValue', $event)"
	>
		<template #render="{ props: inputProps }">
			<input v-bind="inputProps" :data-slot="slot" />
		</template>
	</SdkInput>
	<input v-else-if="type === 'file'" type="file" :data-slot="slot" :class="classes()" />
	<input v-else :type="type" v-model="modelValue" :data-slot="slot" :class="classes()" />
</template>
