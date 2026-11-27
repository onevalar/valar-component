<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<header
		data-slot="page-layout-header"
		:class="cn('flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2', props.class)"
	>
		<slot />
	</header>
</template>
