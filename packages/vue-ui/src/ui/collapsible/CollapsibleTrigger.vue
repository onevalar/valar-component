<script setup lang="ts">
import { cn } from "cn";
import { CollapsibleTrigger, injectCollapsibleRootContext, useForwardExpose } from "reka-ui";
import type { CollapsibleTriggerProps } from "reka-ui";
import { useId, type HTMLAttributes } from "vue";

const props = defineProps<CollapsibleTriggerProps & { class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
const disclosure = injectCollapsibleRootContext();
// Reka otherwise only allocates the content ID after the trigger's initial render.
const id = useId();
disclosure.contentId ||= `collapsible-content-${id}`;
</script>

<template>
	<CollapsibleTrigger :ref="forwardRef" :as="as" :as-child="asChild" data-slot="collapsible-trigger"
		:class="cn('cn-collapsible-trigger focus-visible:outline-solid', props.class)">
		<slot />
	</CollapsibleTrigger>
</template>
