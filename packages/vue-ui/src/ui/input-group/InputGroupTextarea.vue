<script setup lang="ts">
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { Textarea } from "../textarea";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Textarea :ref="forwardRef" data-slot="input-group-control" :class="cn('cn-input-group-textarea flex-1 resize-none', props.class)" />
</template>
