<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<p data-slot="popover-description" :class="cn('cn-popover-description', props.class)">
		<slot />
	</p>
</template>
