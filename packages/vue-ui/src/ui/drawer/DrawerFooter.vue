<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div data-slot="drawer-footer" :class="cn('cn-drawer-footer mt-auto flex flex-col', props.class)">
		<slot />
	</div>
</template>
