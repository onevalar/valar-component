<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<ul
		data-slot="pagination-content"
		:class="cn('cn-pagination-content flex flex-wrap items-center justify-center', props.class)"
	>
		<slot />
	</ul>
</template>
