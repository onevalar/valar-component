<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="page-layout-toolbar"
		:class="cn('flex min-w-0 flex-wrap items-center justify-between gap-2', props.class)"
	>
		<slot />
	</div>
</template>
