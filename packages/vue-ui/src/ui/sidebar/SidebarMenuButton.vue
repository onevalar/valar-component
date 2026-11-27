<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import { computed } from "vue";
import { useSidebar } from "./context.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/index.js";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
	defineProps<
		PrimitiveProps & {
			class?: HTMLAttributes["class"];
			isActive?: boolean;
			variant?: "default" | "outline";
			size?: "default" | "sm" | "lg";
			tooltipContent?: string;
			tooltipContentProps?: InstanceType<typeof TooltipContent>["$props"];
		}
	>(),
	{ as: "button", isActive: false, variant: "default", size: "default" }
);
const { isMobile, open } = useSidebar();
const { forwardRef } = useForwardExpose();
const variants = {
	default: "cn-sidebar-menu-button-variant-default",
	outline: "cn-sidebar-menu-button-variant-outline",
};
const sizes = {
	default: "cn-sidebar-menu-button-size-default",
	sm: "cn-sidebar-menu-button-size-sm",
	lg: "cn-sidebar-menu-button-size-lg",
};
const classes = computed(() =>
	cn(
		"cn-sidebar-menu-button peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
		variants[props.variant],
		sizes[props.size],
		props.class
	)
);
const forwarded = reactiveOmit(
	props,
	"class",
	"isActive",
	"variant",
	"size",
	"tooltipContent",
	"tooltipContentProps"
);
</script>

<template>
	<Tooltip v-if="tooltipContent || $slots.tooltip" :disabled="isMobile || open">
		<TooltipTrigger as-child>
			<Primitive
				:ref="forwardRef"
				:type="!asChild && as === 'button' ? 'button' : undefined"
				v-bind="{ ...$attrs, ...forwarded }"
				data-slot="sidebar-menu-button"
				data-sidebar="menu-button"
				:data-active="isActive"
				:data-variant="variant"
				:data-size="size"
				:class="classes"
				><slot
			/></Primitive>
		</TooltipTrigger>
		<TooltipContent side="right" :aria-label="tooltipContent" v-bind="tooltipContentProps"
			><slot name="tooltip">{{ tooltipContent }}</slot></TooltipContent
		>
	</Tooltip>
	<Primitive
		v-else
		:ref="forwardRef"
		:type="!asChild && as === 'button' ? 'button' : undefined"
		v-bind="{ ...$attrs, ...forwarded }"
		data-slot="sidebar-menu-button"
		data-sidebar="menu-button"
		:data-active="isActive"
		:data-variant="variant"
		:data-size="size"
		:class="classes"
		><slot
	/></Primitive>
</template>
