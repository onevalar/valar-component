<script setup lang="ts">
import { EllipsisIcon } from "@lucide/vue";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<{ class?: HTMLAttributes["class"]; label?: string }>(), {
	label: "更多页",
});
</script>

<template>
	<span
		data-slot="pagination-ellipsis"
		:class="cn('cn-pagination-ellipsis flex items-center justify-center', props.class)"
	>
		<EllipsisIcon aria-hidden="true" />
		<span class="sr-only">{{ label }}</span>
	</span>
</template>
