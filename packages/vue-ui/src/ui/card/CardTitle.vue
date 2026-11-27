<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div data-slot="card-title" :class="cn('cn-font-heading cn-card-title', props.class)">
		<slot />
	</div>
</template>
