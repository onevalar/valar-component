<script setup lang="ts">
import { cn } from "cn";
import { Primitive, useForwardExpose, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), {
	as: "div",
});
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Primitive
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		:type="as === 'button' && !asChild ? 'button' : undefined"
		data-slot="bubble-content"
		:class="
			cn(
				'cn-bubble-content w-fit max-w-full min-w-0 overflow-hidden wrap-break-word motion-reduce:transition-none [button]:text-start [button,a]:transition-colors',
				props.class
			)
		"
	>
		<slot />
	</Primitive>
</template>
