<script setup lang="ts">
import { cn } from "cn";
import { useCommand } from "./context";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ forceMount?: boolean; class?: HTMLAttributes["class"] }>();
const { query } = useCommand();
</script>

<template>
	<div
		v-if="forceMount || !query"
		aria-hidden="true"
		data-slot="command-separator"
		:class="cn('cn-command-separator', props.class)"
	/>
</template>
