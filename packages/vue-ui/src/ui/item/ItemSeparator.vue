<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { useForwardExpose, useForwardProps } from "reka-ui";
import { Separator } from "../separator";
import type { SeparatorProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>(), {
	orientation: "horizontal",
});
const forwarded = useForwardProps(reactiveOmit(props, "class"));
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Separator
		:ref="forwardRef"
		v-bind="forwarded"
		data-slot="item-separator"
		:class="cn('cn-item-separator', props.class)"
	>
		<slot />
	</Separator>
</template>
