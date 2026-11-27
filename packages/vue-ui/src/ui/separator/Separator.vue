<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { Separator, useForwardExpose } from "reka-ui";
import type { SeparatorProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>();
const forwarded = reactiveOmit(props, "class");
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Separator
		:ref="forwardRef"
		data-slot="separator"
		v-bind="forwarded"
		:class="
			cn(
				'shrink-0 bg-[color:var(--valar-separator,var(--valar-separator-base,lch(0%_0_0_/_8.8%)))] data-[orientation=horizontal]:h-[0.5px] data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[0.5px] data-[orientation=vertical]:self-stretch dark:[--valar-separator-base:lch(100%_0_0_/_8.3%)]',
				props.class
			)
		"
	>
		<slot />
	</Separator>
</template>
