<script setup lang="ts">
import { ScrollAreaScrollbar as SdkScrollbar, ScrollAreaThumb } from "@ui-sdk/vue/scroll-area";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { ScrollAreaScrollbarProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<Omit<ScrollAreaScrollbarProps, "asChild"> & { class?: HTMLAttributes["class"] }>(),
	{ orientation: "vertical" }
);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<SdkScrollbar
		:ref="forwardRef"
		:orientation="orientation"
		data-slot="scroll-area-scrollbar"
		:data-orientation="orientation"
		:data-vertical="orientation === 'vertical' ? '' : undefined"
		:data-horizontal="orientation === 'horizontal' ? '' : undefined"
		:class="
			cn(
				'cn-scroll-area-scrollbar flex touch-none p-px opacity-0 transition-[color,opacity] select-none data-visible:opacity-100 motion-reduce:transition-none data-horizontal:h-2.5 data-vertical:w-2.5',
				orientation === 'vertical' && 'h-auto!',
				forceMount && 'flex!',
				props.class
			)
		"
	>
		<template v-if="as && as !== 'div'" #render="{ props: partProps, children }">
			<component :is="as" v-bind="partProps"><component :is="children" /></component>
		</template>
		<slot />
		<ScrollAreaThumb
			data-slot="scroll-area-thumb"
			:class="
				cn(
					'cn-scroll-area-thumb relative shrink-0 bg-border',
					orientation === 'vertical' ? 'w-full' : 'h-full'
				)
			"
		/>
	</SdkScrollbar>
</template>
