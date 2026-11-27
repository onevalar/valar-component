<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="item-footer"
		:class="cn('cn-item-footer flex basis-full items-center justify-between', props.class)"
	>
		<slot />
	</div>
</template>
