<script setup lang="ts">
import { cn } from "cn";
import { provide, useId } from "vue";
import { commandGroupKey, useCommand } from "./context";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	heading?: string;
	value?: string;
	forceMount?: boolean;
	class?: HTMLAttributes["class"];
}>();
const id = `valar-command-heading-${useId()}`;
provide(commandGroupKey, id);
const { groups, mounted } = useCommand();
</script>

<template>
	<div
		v-show="forceMount || !mounted || groups.has(id)"
		role="group"
		:aria-labelledby="heading ? id : undefined"
		data-slot="command-group"
		:data-value="value ?? heading"
		:class="cn('cn-command-group', props.class)"
	>
		<div
			v-if="heading"
			:id="id"
			data-slot="command-group-heading"
			class="px-2 py-1.5 text-xs font-medium text-muted-foreground in-data-[command-dialog]:px-3 in-data-[command-dialog]:py-2 in-data-[command-dialog]:text-[color:var(--valar-command-heading)]"
		>
			{{ heading }}
		</div>
		<div role="presentation"><slot /></div>
	</div>
</template>
