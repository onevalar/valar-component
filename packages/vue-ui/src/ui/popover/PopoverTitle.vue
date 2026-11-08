<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<div data-slot="popover-title" :class="cn('cn-popover-title cn-font-heading', props.class)">
		<slot />
	</div>
</template>
