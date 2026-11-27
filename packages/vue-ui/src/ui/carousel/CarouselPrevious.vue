<script setup lang="ts">
import { CarouselPrevious as SdkPrevious } from "@ui-sdk/vue/carousel";
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
}>(), { variant: "outline", size: "icon-sm", label: "上一张" });
const { sdk, orientation, canScrollPrev, scroll } = useCarousel("CarouselPrevious");
const classes = computed(() => cn('cn-carousel-previous absolute touch-manipulation', orientation.value === 'horizontal' ? 'inset-y-0 -start-12 my-auto' : '-top-12 left-1/2 -translate-x-1/2 rotate-90', props.class));
</script>

<template>
	<component :is="sdk ? SdkPrevious : Button" v-bind="sdk ? {} : { variant, size }" data-slot="carousel-previous" :data-variant="variant" :data-size="size"
		:disabled="disabled || (!sdk && !canScrollPrev)" :aria-disabled="!sdk ? disabled || !canScrollPrev : undefined"
		:class="cn(buttonVariants({variant, size}), 'aria-disabled:opacity-50', classes)"
		@click="(event: MouseEvent) => { if (!sdk && !event.defaultPrevented) scroll('previous'); }">
		<Icon lucide="ChevronLeftIcon" :class="orientation === 'horizontal' ? 'rtl:rotate-180' : undefined" />
		<span class="sr-only">{{ label }}</span>
	</component>
</template>
