<script setup lang="ts">
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { Input } from "../input";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Input :ref="forwardRef" data-slot="input-group-control" :class="cn('cn-input-group-input flex-1', props.class)" />
</template>
