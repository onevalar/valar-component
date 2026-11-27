<script setup lang="ts">
import { CarouselContent as SdkContent, CarouselViewport as SdkViewport } from "@ui-sdk/vue/carousel";
import { cn } from "cn";
import EmblaCarousel from "embla-carousel";
import { onBeforeUnmount, shallowRef, watch, type HTMLAttributes } from "vue";
import { useCarousel, type CarouselAPI, type CarouselOptions } from "./context";

defineOptions({ inheritAttrs: false });
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const { sdk, orientation, direction, opts, plugins, setApi } = useCarousel("CarouselContent");
const viewport = shallowRef<HTMLDivElement | null>(null);
const container = shallowRef<HTMLDivElement | null>(null);
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

function mountEmbla(element: HTMLDivElement) {
	api = EmblaCarousel(element, getOptions(element), plugins.value);
	setApi(api);
}

function unmountEmbla() {
	if (!api) return;
	setApi(undefined);
	api.destroy();
	api = undefined;
}

watch([sdk, viewport], ([useSdk, element]) => {
	unmountEmbla();
	if (!useSdk && element) mountEmbla(element);
}, { flush: "post" });

watch([opts, plugins, direction, orientation], () => {
	if (viewport.value) api?.reInit(getOptions(viewport.value), plugins.value ?? []);
}, { deep: true, flush: "post" });

onBeforeUnmount(unmountEmbla);
</script>

<template>
	<SdkViewport v-if="sdk" data-slot="carousel-content" :tabindex="0" class="scrollbar-none focus-visible:-outline-offset-1 focus-visible:outline-ring data-[orientation=vertical]:h-full">
		<template #render="{ props: part }">
			<div v-bind="part" data-slot="carousel-content" :ref="(element) => { if (typeof part.ref === 'function') part.ref(element); viewport = element as HTMLDivElement | null; }">
				<SdkContent v-bind="$attrs" data-slot="carousel-container"
					:class="cn('gap-4', orientation === 'vertical' && 'h-full', props.class)">
					<template #render="{ props: content }"><div v-bind="content" data-slot="carousel-container" :ref="(element) => { if (typeof content.ref === 'function') content.ref(element); container = element as HTMLDivElement | null; }"><slot /></div></template>
				</SdkContent>
			</div>
		</template>
	</SdkViewport>
	<div v-else ref="viewport" data-slot="carousel-content" :class="cn('overflow-hidden', orientation === 'vertical' ? 'h-full' : undefined)">
		<div ref="container" v-bind="$attrs" data-slot="carousel-container" data-embla-container :data-orientation="orientation"
			:class="cn('flex', orientation === 'horizontal' ? '-ms-4 touch-pan-y touch-pinch-zoom' : '-mt-4 h-full flex-col touch-pan-x touch-pinch-zoom', props.class)">
			<slot />
		</div>
	</div>
</template>
