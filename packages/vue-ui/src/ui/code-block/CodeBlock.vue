<script setup lang="ts">
import { cn } from "cn";
import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "vue";
import type { CodeBlockSize, CodeBlockVariant } from ".";

const props = withDefaults(defineProps<{ variant?: CodeBlockVariant; size?: CodeBlockSize; class?: HTMLAttributes["class"] }>(), {
	variant: "default",
	size: "default",
});
const variants = cva("cn-code-block group/code-block relative flex w-full min-w-0 flex-col overflow-hidden", {
	variants: { variant: { default: "cn-code-block-variant-default", destructive: "cn-code-block-variant-destructive" } },
});
</script>

<template>
	<div data-slot="code-block" :data-variant="variant" :data-size="size" :class="cn(variants({ variant }), props.class)">
		<slot />
	</div>
</template>
