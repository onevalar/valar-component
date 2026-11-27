<script setup lang="ts">
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<PrimitiveProps & { class?: HTMLAttributes["class"]; href?: string }>(),
	{ as: "a" }
);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Primitive
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		:href="href"
		data-slot="breadcrumb-link"
		:class="cn('cn-breadcrumb-link', props.class)"
	>
		<slot />
	</Primitive>
</template>
