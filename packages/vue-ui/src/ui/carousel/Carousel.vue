<script setup lang="ts">
import { cn } from "cn";
import { computed, provide, ref, shallowRef, toRef, type HTMLAttributes } from "vue";
import { carouselContext, type CarouselAPI, type CarouselProps } from "./context";

const props = withDefaults(defineProps<CarouselProps & { class?: HTMLAttributes["class"] }>(), { orientation: "horizontal" });
const emit = defineEmits<{ initApi: [api: CarouselAPI] }>();
const api = shallowRef<CarouselAPI>();
const canScrollPrev = ref(false);
const canScrollNext = ref(false);
const direction = computed(() => props.dir ?? props.opts?.direction);
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

function scroll(move: "previous" | "next") {
	const instance = api.value;
	if (!instance) return;
	const jump = instance.rootNode().ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (move === "previous") instance.scrollPrev(jump);
	else instance.scrollNext(jump);
}

provide(carouselContext, {
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
		scroll(event.key === previous ? "previous" : "next");
	}
}
</script>

<template>
	<div data-slot="carousel" role="region" aria-roledescription="轮播" :dir="direction" :data-orientation="orientation"
		:class="cn('relative min-w-0', props.class)" @keydown="onKeydown">
		<slot />
	</div>
</template>
