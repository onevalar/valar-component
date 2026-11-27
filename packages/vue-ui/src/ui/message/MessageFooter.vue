<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="message-footer"
		:class="
			cn(
				'cn-message-footer flex max-w-full min-w-0 items-center group-data-[align=end]/message:justify-end',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
