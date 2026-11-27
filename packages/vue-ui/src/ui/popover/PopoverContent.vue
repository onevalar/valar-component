<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { PopoverContent, PopoverPortal, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import type { PopoverContentEmits, PopoverContentProps, PopoverPortalProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({
	inheritAttrs: false,
});

const props = withDefaults(
	defineProps<
		PopoverContentProps & {
			class?: HTMLAttributes["class"];
			appearance?: "default" | "surface" | "options";
			portalProps?: PopoverPortalProps;
		}
	>(),
	{
		align: "center",
		sideOffset: 4,
		collisionPadding: 8,
		appearance: "default",
	}
);
const emits = defineEmits<PopoverContentEmits>();

const delegatedProps = reactiveOmit(props, "class", "appearance", "portalProps");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<PopoverPortal v-bind="props.portalProps">
		<PopoverContent
			:ref="forwardRef"
			data-slot="popover-content"
			:data-appearance="props.appearance"
			v-bind="{ ...$attrs, ...forwarded }"
			:class="
				cn(
					'cn-popover-content cn-overlay-surface cn-popover-viewport z-50 origin-(--reka-popover-content-transform-origin) outline-hidden',
					props.appearance === 'options' ? 'w-[330px]' : 'w-72',
					props.appearance === 'surface' && 'cn-overlay-menu-rows animate-none!',
					props.appearance === 'options' && 'cn-popover-options animate-none!',
					props.class
				)
			"
		>
			<slot />
		</PopoverContent>
	</PopoverPortal>
</template>
