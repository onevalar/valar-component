<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { AspectRatio as AspectRatioPrimitive, useForwardExpose, useForwardProps } from "reka-ui";
import type { AspectRatioProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<AspectRatioProps & { class?: HTMLAttributes["class"] }>();
const forwarded = useForwardProps(reactiveOmit(props, "class"));
const { forwardRef } = useForwardExpose();
</script>

<template>
	<AspectRatioPrimitive
		:ref="forwardRef"
		v-bind="forwarded"
		data-slot="aspect-ratio"
		:class="cn('cn-aspect-ratio-geometry', props.class)"
	>
		<slot />
	</AspectRatioPrimitive>
</template>
