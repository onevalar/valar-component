<script setup lang="ts">
import { cn } from "cn";
import { Primitive, useForwardExpose, type PrimitiveProps } from "reka-ui";
import { markerVariants, type MarkerVariant } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<PrimitiveProps & { class?: HTMLAttributes["class"]; variant?: MarkerVariant }>(),
	{ as: "div", variant: "default" }
);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Primitive
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		:type="as === 'button' && !asChild ? 'button' : undefined"
		data-slot="marker"
		:data-variant="variant"
		:class="cn(markerVariants({ variant }), props.class)"
	>
		<slot />
	</Primitive>
</template>
