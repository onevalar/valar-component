<script setup lang="ts">
import { TabsList as SdkList } from "@ui-sdk/vue/tabs";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { TabsListProps } from "reka-ui";
import { inject, onBeforeUnmount, watchEffect, type HTMLAttributes } from "vue";
import ToggleTrigger from "../../lib/ToggleTrigger";
import { tabsListVariants, type TabsListVariant } from ".";
import { tabsContext } from "./context";

const props = withDefaults(defineProps<TabsListProps & {
	class?: HTMLAttributes["class"];
	variant?: TabsListVariant;
	loop?: boolean;
}>(), { variant: "default", loop: undefined });
const emit = defineEmits<{ focusin: [event: FocusEvent] }>();
const { forwardRef } = useForwardExpose();
const context = inject(tabsContext, undefined);
if (context) {
	watchEffect(() => { context.listLoop.value = props.loop; });
	onBeforeUnmount(() => { context.listLoop.value = undefined; });
}

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
	<SdkList :data-variant="variant"
		:class="cn(tabsListVariants({ variant }), props.class)" @focusin="revealFocusedTab">
		<template #render="{ props: part }">
			<ToggleTrigger :ref="forwardRef" :as="as ?? 'div'" :as-child="asChild" :part="{ ...part, 'data-slot': 'tabs-list' }">
				<slot />
			</ToggleTrigger>
		</template>
	</SdkList>
</template>
