<script setup lang="ts">
import { CarouselItem as SdkItem } from "@ui-sdk/vue/carousel";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import { useCarousel } from "./context";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const { orientation, sdk } = useCarousel("CarouselItem");
</script>

<template>
	<component :is="sdk ? SdkItem : 'div'" data-slot="carousel-item" data-embla-slide :data-orientation="orientation" role="group" aria-roledescription="幻灯片"
		:class="cn('min-h-0 min-w-0 shrink-0 grow-0 basis-full', !sdk && (orientation === 'horizontal' ? 'ps-4' : 'pt-4'), props.class)">
		<slot />
	</component>
</template>
