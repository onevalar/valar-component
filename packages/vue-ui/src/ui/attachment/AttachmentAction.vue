<script setup lang="ts">
import { Button, type ButtonVariants } from "../button";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		variant?: ButtonVariants["variant"];
		size?: ButtonVariants["size"];
		shape?: ButtonVariants["shape"];
		type?: "button" | "submit" | "reset";
		href?: string;
		disabled?: boolean;
	}>(),
	{ variant: "ghost", size: "icon-xs" }
);
const emit = defineEmits<{ click: [event: MouseEvent] }>();

function onClick(event: MouseEvent) {
	if (props.disabled) {
		event.preventDefault();
		event.stopPropagation();
		return;
	}
	emit("click", event);
}
</script>

<template>
	<Button
		v-bind="props"
		:as="href === undefined ? 'button' : 'a'"
		data-slot="attachment-action"
		@click="onClick"
	>
		<slot />
	</Button>
</template>
