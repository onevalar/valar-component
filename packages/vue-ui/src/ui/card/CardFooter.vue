<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div data-slot="card-footer" :class="cn('cn-card-footer flex items-center', props.class)">
		<slot />
	</div>
</template>
