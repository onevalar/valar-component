<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { SelectLabel, useForwardProps } from "reka-ui";
import type { SelectLabelProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes["class"] }>();
const forwarded = useForwardProps(reactiveOmit(props, "class"));
</script>

<template>
	<SelectLabel
		data-slot="select-label"
		v-bind="forwarded"
		:class="cn('cn-select-label', props.class)"
	>
		<slot />
	</SelectLabel>
</template>
