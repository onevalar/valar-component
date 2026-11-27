<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div data-slot="card-content" :class="cn('cn-card-content', props.class)"><slot /></div>
</template>
