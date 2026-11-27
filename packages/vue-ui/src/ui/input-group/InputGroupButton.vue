<script setup lang="ts">
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { Button, type ButtonVariants } from "../button";
import { inputGroupButtonVariants, type InputGroupButtonSize, type InputGroupButtonShape } from ".";

const props = withDefaults(defineProps<{
	class?: HTMLAttributes["class"];
	size?: InputGroupButtonSize;
	shape?: InputGroupButtonShape;
	variant?: ButtonVariants["variant"];
}>(), { size: "xs", shape: "auto", variant: "ghost" });
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Button :ref="forwardRef" :size="size" :variant="variant" :shape="shape === 'auto' ? 'square' : shape"
		:class="cn(inputGroupButtonVariants({ size }), props.class)"><slot /></Button>
</template>
