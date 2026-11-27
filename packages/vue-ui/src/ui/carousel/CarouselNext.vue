<script setup lang="ts">
import { CarouselNext as SdkNext } from "@ui-sdk/vue/carousel";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import Icon from "../../lib/Icon.vue";
import { Button, buttonVariants, type ButtonVariants } from "../button";
import { computed } from "vue";
import { useCarousel } from "./context";

const props = withDefaults(defineProps<{
	class?: HTMLAttributes["class"];
	label?: string;
	variant?: ButtonVariants["variant"];
	size?: ButtonVariants["size"];
	disabled?: boolean;
}>(), { variant: "outline", size: "icon-sm", label: "下一张" });
const { sdk, orientation, canScrollNext, scroll } = useCarousel("CarouselNext");
const classes = computed(() => cn('cn-carousel-next absolute touch-manipulation', orientation.value === 'horizontal' ? 'inset-y-0 -end-12 my-auto' : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90', props.class));
</script>

<template>
	<component :is="sdk ? SdkNext : Button" v-bind="sdk ? {} : { variant, size }" data-slot="carousel-next" :data-variant="variant" :data-size="size"
		:disabled="disabled || (!sdk && !canScrollNext)" :aria-disabled="!sdk ? disabled || !canScrollNext : undefined"
		:class="cn(buttonVariants({variant, size}), 'aria-disabled:opacity-50', classes)"
		@click="(event: MouseEvent) => { if (!sdk && !event.defaultPrevented) scroll('next'); }">
		<Icon lucide="ChevronRightIcon" :class="orientation === 'horizontal' ? 'rtl:rotate-180' : undefined" />
		<span class="sr-only">{{ label }}</span>
	</component>
</template>
