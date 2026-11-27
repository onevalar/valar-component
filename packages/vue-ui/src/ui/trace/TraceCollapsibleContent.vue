<script setup lang="ts">
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import { CollapsibleContent } from "../collapsible";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"]; forceMount?: boolean }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<CollapsibleContent
		:ref="forwardRef"
		:force-mount="forceMount"
		data-slot="trace-collapsible-content"
		class="cn-trace-collapsible-content min-w-0 overflow-hidden [--accordion-panel-height:var(--reka-collapsible-content-height)] motion-safe:data-open:animate-[accordion-down_200ms_ease-out] motion-safe:data-closed:animate-[accordion-up_200ms_ease-out]"
	>
		<div
			data-slot="trace-collapsible-content-inner"
			:class="
				cn(
					'cn-trace-collapsible-content-inner min-w-0 wrap-break-word text-muted-foreground',
					props.class
				)
			"
		>
			<slot />
		</div>
	</CollapsibleContent>
</template>
