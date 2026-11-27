<script setup lang="ts">
import { cn } from "cn";
import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport, useForwardExpose } from "reka-ui";
import type { ScrollAreaRootProps, ScrollAreaViewportProps } from "reka-ui";
import { computed, useTemplateRef, type HTMLAttributes } from "vue";
import ScrollAreaScrollbar from "./ScrollAreaScrollbar.vue";

const props = withDefaults(defineProps<Omit<ScrollAreaRootProps, "asChild"> & {
	class?: HTMLAttributes["class"];
	appearance?: "default" | "settings";
	orientation?: "vertical" | "horizontal" | "both";
	viewportLabel?: string;
	overscroll?: "auto" | "contain";
	scrollbarXClasses?: HTMLAttributes["class"];
	scrollbarYClasses?: HTMLAttributes["class"];
	nonce?: ScrollAreaViewportProps["nonce"];
}>(), { appearance: "default", orientation: "vertical", overscroll: "auto" });

const viewport = useTemplateRef<InstanceType<typeof ScrollAreaViewport>>("viewportRef");
defineExpose({ viewport: computed(() => viewport.value?.viewportElement ?? null) });
const { forwardRef } = useForwardExpose();
</script>

<template>
	<ScrollAreaRoot :ref="forwardRef" :as="as" :dir="dir" :type="type ?? (appearance === 'settings' ? 'auto' : 'hover')"
		:scroll-hide-delay="scrollHideDelay" data-slot="scroll-area" :data-appearance="appearance"
		:class="cn('relative min-h-0 min-w-0', props.class)">
		<ScrollAreaViewport ref="viewportRef" :nonce="nonce" data-slot="scroll-area-viewport"
			:role="viewportLabel ? 'region' : undefined" :aria-label="viewportLabel"
			:style="{ overflowX: orientation === 'vertical' ? 'hidden' : 'scroll', overflowY: orientation === 'horizontal' ? 'hidden' : 'scroll' }"
			:class="cn('size-full max-h-[inherit] rounded-[inherit] outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring', overscroll === 'contain' && 'overscroll-contain')"
			as-child>
			<!-- Keep the declared axis live even when Reka clears both axis flags on a scrollbar unmount. -->
			<div :class="orientation !== 'vertical' ? 'min-w-fit' : undefined">
				<slot />
			</div>
		</ScrollAreaViewport>
		<ScrollAreaScrollbar v-if="orientation !== 'horizontal'" orientation="vertical"
			:class="cn(appearance === 'settings' && 'cn-scroll-area-scrollbar-settings', scrollbarYClasses)" />
		<ScrollAreaScrollbar v-if="orientation !== 'vertical'" orientation="horizontal"
			:class="cn(appearance === 'settings' && 'cn-scroll-area-scrollbar-settings', scrollbarXClasses)" />
		<ScrollAreaCorner data-slot="scroll-area-corner" />
	</ScrollAreaRoot>
</template>
