<script setup lang="ts">
import { cn } from "cn";
import { AccordionContent, useForwardExpose } from "reka-ui";
import type { AccordionContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<Omit<AccordionContentProps, "asChild"> & { class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<AccordionContent :ref="forwardRef" :as="as" :force-mount="forceMount" data-slot="accordion-content"
		:class="cn('cn-accordion-content overflow-hidden motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none')"
		:style="{ '--bits-accordion-content-height': 'var(--reka-accordion-content-height)', '--accordion-panel-height': 'var(--reka-accordion-content-height)' }">
		<div :class="cn('cn-accordion-content-inner [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4', props.class)">
			<slot />
		</div>
	</AccordionContent>
</template>
