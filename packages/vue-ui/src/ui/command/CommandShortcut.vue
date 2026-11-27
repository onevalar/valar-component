<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<span data-slot="command-shortcut" :class="cn('cn-command-shortcut', props.class)">
		<slot />
	</span>
</template>
