<script setup lang="ts">
import { cn } from "cn";
import { bubbleVariants, type BubbleAlign, type BubbleVariant } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{ class?: HTMLAttributes["class"]; align?: BubbleAlign; variant?: BubbleVariant }>(),
	{ align: "start", variant: "default" }
);
</script>

<template>
	<div
		data-slot="bubble"
		:data-align="align"
		:data-variant="variant"
		:class="cn(bubbleVariants({ variant }), props.class)"
	>
		<slot />
	</div>
</template>
