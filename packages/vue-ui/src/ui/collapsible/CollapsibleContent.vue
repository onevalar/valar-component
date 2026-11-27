<script setup lang="ts">
import { cn } from "cn";
import { CollapsibleContent, useForwardExpose } from "reka-ui";
import type { CollapsibleContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<CollapsibleContentProps & { class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<CollapsibleContent :ref="forwardRef" :as="as" :as-child="asChild" :force-mount="forceMount"
		data-slot="collapsible-content" :class="cn(props.class)">
		<slot />
	</CollapsibleContent>
</template>
