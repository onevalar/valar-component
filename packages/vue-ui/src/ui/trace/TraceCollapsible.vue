<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import {
	useForwardExpose,
	useForwardPropsEmits,
	type CollapsibleRootEmits,
	type CollapsibleRootProps,
} from "reka-ui";
import { Collapsible } from "../collapsible";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<CollapsibleRootProps & { class?: HTMLAttributes["class"] }>(),
	{ open: undefined }
);
const emit = defineEmits<CollapsibleRootEmits>();
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class"), emit);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Collapsible
		:ref="forwardRef"
		v-slot="state"
		v-bind="forwarded"
		data-slot="trace-collapsible"
		:class="cn('flex w-full min-w-0 flex-col', props.class)"
	>
		<slot v-bind="state" />
	</Collapsible>
</template>
