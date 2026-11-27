<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { ToggleGroupItem, useForwardExpose, useForwardProps } from "reka-ui";
import type { ToggleGroupItemProps } from "reka-ui";
import { computed, inject, type HTMLAttributes } from "vue";
import { toggleVariants, type ToggleSize, type ToggleVariant } from "../toggle";
import { toggleGroupStyle } from "./context";

const props = defineProps<Omit<ToggleGroupItemProps, "value"> & {
	value: string;
	class?: HTMLAttributes["class"];
	size?: ToggleSize;
	variant?: ToggleVariant;
}>();
const forwarded = useForwardProps(reactiveOmit(props, "class", "size", "variant"));
const { forwardRef } = useForwardExpose();
const context = inject(toggleGroupStyle, undefined);
const size = computed(() => context?.size.value ?? props.size ?? "default");
const variant = computed(() => context?.variant.value ?? props.variant ?? "default");
</script>

<template>
	<ToggleGroupItem :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="toggle-group-item"
		:data-size="size" :data-variant="variant" :data-spacing="context?.spacing.value"
		:class="context?.appearance.value === 'toolbar' ? cn('cn-toggle-group-toolbar-item', props.class) : cn(
			'cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l-[0.5px] group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t-[0.5px]',
			toggleVariants({ size, variant }), props.class)">
		<slot v-bind="state" />
	</ToggleGroupItem>
</template>
