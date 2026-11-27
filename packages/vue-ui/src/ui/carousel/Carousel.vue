<script setup lang="ts">
import { Carousel as SdkCarousel, createCarouselController } from "@ui-sdk/vue/carousel";
import { cn } from "cn";
import { computed, getCurrentInstance, provide, ref, shallowRef, toRef, type HTMLAttributes } from "vue";
import { carouselContext, type CarouselAPI, type CarouselProps } from "./context";

const props = withDefaults(defineProps<CarouselProps & { class?: HTMLAttributes["class"] }>(), { orientation: "horizontal" });
const emit = defineEmits<{ initApi: [api: CarouselAPI] }>();
const api = shallowRef<CarouselAPI>();
const canScrollPrev = ref(false);
const canScrollNext = ref(false);
const direction = computed(() => props.dir ?? props.opts?.direction);
const attrs = getCurrentInstance()?.vnode.props;
const sdk = computed(() => props.engine !== "embla" && !props.opts && !props.plugins && !props.setApi && !attrs?.onInitApi);
const controller = createCarouselController();
defineExpose({ api });

function sync(instance?: CarouselAPI) {
	canScrollPrev.value = instance?.canScrollPrev() ?? false;
	canScrollNext.value = instance?.canScrollNext() ?? false;
}

function setApi(instance?: CarouselAPI) {
	api.value?.off("select", sync).off("reInit", sync);
	api.value = instance;
	instance?.on("select", sync).on("reInit", sync);
	sync(instance);
	props.setApi?.(instance);
	if (instance) emit("initApi", instance);
}

function scroll(move: "previous" | "next", event?: KeyboardEvent) {
	if (sdk.value) {
		controller[move]({ reason: "list-navigation", event });
		return;
	}
	const instance = api.value;
	if (!instance) return;
	const jump = instance.rootNode().ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (move === "previous") instance.scrollPrev(jump);
	else instance.scrollNext(jump);
}

provide(carouselContext, {
	sdk,
	controller,
	orientation: toRef(props, "orientation"),
	direction,
	opts: toRef(props, "opts"),
	plugins: toRef(props, "plugins"),
	canScrollPrev,
	canScrollNext,
	setApi,
	scroll,
});

function onKeydown(event: KeyboardEvent) {
	if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
	const root = event.currentTarget;
	const target = event.target;
	if (!(root instanceof HTMLElement) || !(target instanceof HTMLElement) ||
		(target !== root && (!target.matches('[data-slot="carousel-previous"], [data-slot="carousel-next"]') ||
			target.closest('[data-slot="carousel"]') !== root))) return;

	const rtl = (direction.value ?? getComputedStyle(root).direction) === "rtl";
	const previous = props.orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
	const next = props.orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
	if (event.key === previous || event.key === next) {
		event.preventDefault();
		scroll(event.key === previous ? "previous" : "next", event);
	}
}
</script>

<template>
	<SdkCarousel v-if="sdk" :controller="controller" :orientation="orientation" data-slot="carousel"
		aria-roledescription="轮播" :dir="direction" :class="cn('relative min-w-0', props.class)" @keydown="onKeydown">
		<slot />
	</SdkCarousel>
	<div v-else data-slot="carousel" role="region" aria-roledescription="轮播" :dir="direction" :data-orientation="orientation"
		:class="cn('relative min-w-0', props.class)" @keydown="onKeydown">
		<slot />
	</div>
</template>
