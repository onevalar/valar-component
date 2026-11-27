<script setup lang="ts">
import { cn } from "cn";
import { useCommand } from "./context";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ forceMount?: boolean; class?: HTMLAttributes["class"] }>();
const { mounted, visible } = useCommand();
</script>

<template>
	<div
		role="status"
		data-slot="command-empty"
		:class="cn('cn-command-empty empty:sr-only', props.class)"
	>
		<slot v-if="forceMount || (mounted && visible.size === 0)" />
	</div>
</template>
