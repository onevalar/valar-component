<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import Icon from "../../lib/Icon.vue";
import { Button, type ButtonVariants } from "../button";
import { useCarousel } from "./context";

const props = withDefaults(defineProps<{
	class?: HTMLAttributes["class"];
	label?: string;
	variant?: ButtonVariants["variant"];
	size?: ButtonVariants["size"];
	disabled?: boolean;
}>(), { variant: "outline", size: "icon-sm", label: "上一张" });
const { orientation, canScrollPrev, scroll } = useCarousel("CarouselPrevious");
</script>

<template>
	<Button data-slot="carousel-previous" :variant="variant" :size="size" :disabled="disabled || !canScrollPrev"
		:aria-disabled="disabled || !canScrollPrev"
		:class="cn('cn-carousel-previous absolute touch-manipulation', orientation === 'horizontal' ? 'inset-y-0 -start-12 my-auto' : '-top-12 left-1/2 -translate-x-1/2 rotate-90', props.class)"
		@click="scroll('previous')">
		<Icon lucide="ChevronLeftIcon" :class="orientation === 'horizontal' ? 'rtl:rotate-180' : undefined" />
		<span class="sr-only">{{ label }}</span>
	</Button>
</template>
