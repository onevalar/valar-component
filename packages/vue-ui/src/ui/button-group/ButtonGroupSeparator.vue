<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { useForwardExpose, useForwardProps } from "reka-ui";
import type { SeparatorProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { Separator } from "../separator";

const props = withDefaults(defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>(), { orientation: "vertical", decorative: true });
const forwarded = useForwardProps(reactiveOmit(props, "class"));
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Separator :ref="forwardRef" v-bind="forwarded" data-slot="button-group-separator"
		:class="cn('cn-button-group-separator relative self-stretch data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto', props.class)" />
</template>
