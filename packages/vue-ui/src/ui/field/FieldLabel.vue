<script setup lang="ts">
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { Label } from "../label";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Label :ref="forwardRef" data-slot="field-label" :class="cn('cn-field-label group/field-label peer/field-label flex w-fit has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col', props.class)">
		<slot />
	</Label>
</template>
