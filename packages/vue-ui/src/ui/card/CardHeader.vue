<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="card-header"
		:class="cn('cn-card-header group/card-header @container/card-header grid min-w-0', props.class)"
	>
		<div
			class="grid min-w-0 auto-rows-min grid-cols-[minmax(0,1fr)] items-start gap-[inherit] @min-[17rem]/card-header:has-[>[data-slot=card-action]]:grid-cols-[minmax(0,1fr)_minmax(0,40%)]"
		>
			<slot />
		</div>
	</div>
</template>
