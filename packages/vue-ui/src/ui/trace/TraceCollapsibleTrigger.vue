<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import TraceIcon from "./TraceIcon.vue";
import { CollapsibleTrigger } from "../collapsible";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<CollapsibleTrigger
		:ref="forwardRef"
		data-slot="trace-collapsible-trigger"
		:class="
			cn(
				'cn-trace-collapsible-trigger group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center text-start outline-none focus-visible:outline-hidden! focus-visible:-outline-offset-2! disabled:cursor-default disabled:opacity-50 has-[[data-status=error]]:text-destructive',
				props.class
			)
		"
	>
		<slot />
		<TraceIcon
			class="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90 motion-reduce:transition-none rtl:rotate-180 rtl:group-aria-expanded/trace-collapsible-trigger:rotate-90"
		>
			<ChevronRight />
		</TraceIcon>
	</CollapsibleTrigger>
</template>
