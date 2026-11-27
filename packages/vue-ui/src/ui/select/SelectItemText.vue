<script setup lang="ts">
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<span data-slot="select-item-text" :class="props.class">
		<slot />
	</span>
</template>
