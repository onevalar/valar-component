<script setup lang="ts">
import { cn } from "cn";
import { CollapsiblePanel as SdkPanel } from "@ui-sdk/vue/collapsible";
import { useForwardExpose } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"]; forceMount?: boolean }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<SdkPanel
		:ref="forwardRef"
		:keep-mounted="forceMount"
		data-slot="trace-collapsible-content"
		class="cn-trace-collapsible-content min-w-0 overflow-hidden [--accordion-panel-height:var(--collapsible-panel-height)] motion-safe:data-open:animate-[accordion-down_200ms_ease-out] motion-safe:data-closed:animate-[accordion-up_200ms_ease-out]"
	>
		<template #render="{ props: part, state }">
		<div v-bind="part" data-slot="trace-collapsible-content" :hidden="!forceMount && (part.hidden === '' || part.hidden === true)" :data-state="state.open ? 'open' : 'closed'">
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
		</div>
		</template>
	</SdkPanel>
</template>
