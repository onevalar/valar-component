<script setup lang="ts">
import { cn } from "cn";
import { ScrollAreaScrollbar, ScrollAreaThumb, useForwardExpose } from "reka-ui";
import type { ScrollAreaScrollbarProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<Omit<ScrollAreaScrollbarProps, "asChild"> & { class?: HTMLAttributes["class"] }>(), { orientation: "vertical" });
const { forwardRef } = useForwardExpose();
</script>

<template>
	<ScrollAreaScrollbar :ref="forwardRef" :as="as" :orientation="orientation" :force-mount="forceMount"
		data-slot="scroll-area-scrollbar" :data-orientation="orientation"
		:class="cn('cn-scroll-area-scrollbar flex touch-none p-px transition-colors select-none motion-reduce:transition-none', props.class)">
		<slot />
		<ScrollAreaThumb data-slot="scroll-area-thumb" class="cn-scroll-area-thumb relative flex-1 bg-border" />
	</ScrollAreaScrollbar>
</template>
