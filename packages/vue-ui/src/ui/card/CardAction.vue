<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="card-action"
		:class="
			cn(
				'cn-card-action order-last max-w-full min-w-0 self-start justify-self-start @min-[17rem]/card-header:col-start-2 @min-[17rem]/card-header:row-span-2 @min-[17rem]/card-header:row-start-1 @min-[17rem]/card-header:justify-self-end',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
