<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="item-content"
		:class="
			cn(
				'cn-item-content flex min-w-0 flex-1 flex-col [&+[data-slot=item-content]]:flex-none',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
