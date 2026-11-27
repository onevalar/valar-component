<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { TooltipArrow, TooltipContent, TooltipPortal, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import type { TooltipContentEmits, TooltipContentProps, TooltipPortalProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<TooltipContentProps & {
	class?: HTMLAttributes["class"];
	appearance?: "default" | "surface";
	arrowClasses?: string;
	portalProps?: TooltipPortalProps;
}>(), { appearance: "default", side: "top", sideOffset: 6, collisionPadding: 8 });
const emit = defineEmits<TooltipContentEmits>();
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class", "appearance", "arrowClasses", "portalProps"), emit);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<TooltipPortal v-bind="portalProps">
		<TooltipContent :ref="forwardRef" v-bind="{ ...$attrs, ...forwarded }" data-slot="tooltip-content"
			:class="cn('cn-tooltip-content cn-overlay-surface z-50 w-fit max-w-[min(20rem,calc(100vw-1rem))] origin-(--reka-tooltip-content-transform-origin) wrap-anywhere [&>*]:min-w-0', appearance === 'surface' && 'animate-none!', props.class)">
			<slot />
			<TooltipArrow v-if="appearance === 'default' && arrowClasses !== undefined" data-slot="tooltip-arrow" :class="cn('fill-popover stroke-border', arrowClasses)" />
		</TooltipContent>
	</TooltipPortal>
</template>
