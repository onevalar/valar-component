<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { Label, useForwardExpose, useForwardProps } from "reka-ui";
import type { LabelProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<LabelProps & {
	class?: HTMLAttributes["class"];
	appearance?: "default" | "settings";
	required?: boolean;
}>(), { appearance: "default" });
const forwarded = useForwardProps(reactiveOmit(props, "class", "appearance", "required"));
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Label
		:ref="forwardRef"
		data-slot="label"
		:data-appearance="appearance"
		v-bind="forwarded"
		:class="cn('cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed', appearance === 'settings' && 'cn-label-appearance-settings', props.class)"
	>
		<slot />
		<span v-if="required" data-slot="label-required" aria-hidden="true" class="text-destructive">*</span>
	</Label>
</template>
