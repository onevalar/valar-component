<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="field-group"
		:class="cn('cn-field-group group/field-group @container/field-group flex w-full flex-col', props.class)"
	>
		<slot />
	</div>
</template>
