<script setup lang="ts">
import { cn } from "cn";
import EmblaCarousel from "embla-carousel";
import { onBeforeUnmount, onMounted, useTemplateRef, watch, type HTMLAttributes } from "vue";
import { useCarousel, type CarouselAPI, type CarouselOptions } from "./context";

defineOptions({ inheritAttrs: false });
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const { orientation, direction, opts, plugins, setApi } = useCarousel("CarouselContent");
const viewport = useTemplateRef<HTMLDivElement>("viewport");
const container = useTemplateRef<HTMLDivElement>("container");
defineExpose({ viewport, container });
let api: CarouselAPI | undefined;

function getOptions(element: HTMLElement): CarouselOptions {
	return {
		container: "[data-embla-container]",
		slides: "[data-embla-slide]",
		...opts.value,
		direction: direction.value ?? (getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr"),
		axis: orientation.value === "vertical" ? "y" : "x",
	};
}

onMounted(() => {
	if (!viewport.value) return;
	api = EmblaCarousel(viewport.value, getOptions(viewport.value), plugins.value);
	setApi(api);
});

watch([opts, plugins, direction, orientation], () => {
	if (viewport.value) api?.reInit(getOptions(viewport.value), plugins.value ?? []);
}, { deep: true, flush: "post" });

onBeforeUnmount(() => {
	if (!api) return;
	setApi(undefined);
	api.destroy();
	api = undefined;
});
</script>

<template>
	<div ref="viewport" data-slot="carousel-content" :class="cn('overflow-hidden', orientation === 'vertical' ? 'h-full' : undefined)">
		<div ref="container" v-bind="$attrs" data-slot="carousel-container" data-embla-container :data-orientation="orientation"
			:class="cn('flex', orientation === 'horizontal' ? '-ms-4 touch-pan-y touch-pinch-zoom' : '-mt-4 h-full flex-col touch-pan-x touch-pinch-zoom', props.class)">
			<slot />
		</div>
	</div>
</template>
