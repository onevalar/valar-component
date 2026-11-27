<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { Toggle, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import type { ToggleEmits, ToggleProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { toggleVariants, type ToggleSize, type ToggleVariant } from ".";

const props = withDefaults(defineProps<ToggleProps & {
	class?: HTMLAttributes["class"];
	size?: ToggleSize;
	variant?: ToggleVariant;
}>(), { size: "default", variant: "default", defaultValue: false });
const emit = defineEmits<ToggleEmits>();
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class", "size", "variant"), emit);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Toggle :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="toggle" :data-size="size" :data-variant="variant" :class="cn(toggleVariants({ size, variant }), props.class)">
		<slot v-bind="state" />
	</Toggle>
</template>
