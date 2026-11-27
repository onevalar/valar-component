<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { TabsList, useForwardExpose, useForwardProps } from "reka-ui";
import type { TabsListProps } from "reka-ui";
import { inject, type HTMLAttributes } from "vue";
import { tabsListVariants, type TabsListVariant } from ".";
import { tabsContext } from "./context";

const props = withDefaults(defineProps<TabsListProps & {
	class?: HTMLAttributes["class"];
	variant?: TabsListVariant;
	loop?: boolean;
}>(), { variant: "default", loop: undefined });
const emit = defineEmits<{ focusin: [event: FocusEvent] }>();
const forwarded = useForwardProps(reactiveOmit(props, "class", "variant", "loop"));
const { forwardRef } = useForwardExpose();
const context = inject(tabsContext, undefined);

function revealFocusedTab(event: FocusEvent) {
	emit("focusin", event);
	const list = event.currentTarget;
	const tab = event.target;
	if (event.defaultPrevented || !(list instanceof HTMLElement) || !(tab instanceof HTMLElement)
		|| list.dataset.orientation !== "horizontal" || list.scrollWidth <= list.clientWidth
		|| tab.dataset.slot !== "tabs-trigger" || tab.closest('[role="tablist"]') !== list) return;
	const start = list.getBoundingClientRect().left + list.clientLeft;
	const end = start + list.clientWidth;
	const bounds = tab.getBoundingClientRect();
	if (bounds.left < start) list.scrollBy({ left: bounds.left - start, behavior: "instant" });
	else if (bounds.right > end) list.scrollBy({ left: bounds.right - end, behavior: "instant" });
}
</script>

<template>
	<TabsList :ref="forwardRef" v-bind="forwarded" :loop="props.loop ?? context?.loop.value ?? false"
		data-slot="tabs-list" :data-variant="variant" :data-orientation="context?.orientation.value"
		:class="cn(tabsListVariants({ variant }), props.class)" @focusin="revealFocusedTab">
		<slot />
	</TabsList>
</template>
