<script setup lang="ts">
import { cn } from "cn";
import { useCommand } from "./context";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const { list, listId, label, mounted, visible } = useCommand();
</script>

<template>
	<div
		:id="listId"
		ref="list"
		role="listbox"
		:aria-label="label ?? '命令结果'"
		data-slot="command-list"
		:data-empty="mounted && visible.size === 0 ? '' : undefined"
		:class="cn('cn-command-list overflow-x-hidden overflow-y-auto', props.class)"
	>
		<div data-slot="command-viewport">
			<slot />
		</div>
	</div>
</template>
