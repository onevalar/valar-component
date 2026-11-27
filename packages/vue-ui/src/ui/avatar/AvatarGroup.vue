<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div data-slot="avatar-group" :class="cn('group/avatar-group flex max-w-full flex-wrap gap-y-1 ps-2 *:-ms-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background', props.class)">
		<slot />
	</div>
</template>
