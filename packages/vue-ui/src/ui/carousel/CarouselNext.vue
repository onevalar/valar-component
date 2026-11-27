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
}>(), { variant: "outline", size: "icon-sm", label: "下一张" });
const { orientation, canScrollNext, scroll } = useCarousel("CarouselNext");
</script>

<template>
	<Button data-slot="carousel-next" :variant="variant" :size="size" :disabled="disabled || !canScrollNext"
		:aria-disabled="disabled || !canScrollNext"
		:class="cn('cn-carousel-next absolute touch-manipulation', orientation === 'horizontal' ? 'inset-y-0 -end-12 my-auto' : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90', props.class)"
		@click="scroll('next')">
		<Icon lucide="ChevronRightIcon" :class="orientation === 'horizontal' ? 'rtl:rotate-180' : undefined" />
		<span class="sr-only">{{ label }}</span>
	</Button>
</template>
