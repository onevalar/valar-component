<script setup lang="ts">
import { cn } from "cn";
import { AccordionHeader, AccordionTrigger, injectAccordionItemContext, injectCollapsibleRootContext, useForwardExpose } from "reka-ui";
import type { AccordionTriggerProps } from "reka-ui";
import { useId, type HTMLAttributes } from "vue";
import Icon from "../../lib/Icon.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<AccordionTriggerProps & {
	class?: HTMLAttributes["class"];
	id?: string;
	level?: 1 | 2 | 3 | 4 | 5 | 6;
}>(), { level: 3 });
const { forwardRef } = useForwardExpose();
const item = injectAccordionItemContext();
const disclosure = injectCollapsibleRootContext();
// Reka otherwise only allocates the content ID after the trigger's initial render.
const id = useId();
item.triggerId = props.id ?? `accordion-trigger-${id}`;
disclosure.contentId ||= `accordion-content-${id}`;
</script>

<template>
	<AccordionHeader :as="`h${level}`" class="flex">
		<AccordionTrigger :ref="forwardRef" v-bind="$attrs" :as="as" :as-child="asChild" data-slot="accordion-trigger"
			:class="cn('cn-accordion-trigger group/accordion-trigger relative flex min-w-0 flex-1 items-start justify-between border border-transparent outline-none disabled:pointer-events-none disabled:opacity-50', props.class)">
			<slot />
			<template v-if="!asChild">
				<Icon lucide="ChevronDownIcon" data-slot="accordion-trigger-icon" class="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
				<Icon lucide="ChevronUpIcon" data-slot="accordion-trigger-icon" class="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
			</template>
		</AccordionTrigger>
	</AccordionHeader>
</template>
