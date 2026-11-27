<script setup lang="ts">
import { useForwardExpose } from "reka-ui";
import { useAttrs } from "vue";
import { Button } from "../button/index.js";
import type { ButtonVariants } from "../button/index.js";
import type { PrimitiveProps } from "reka-ui";

const props = withDefaults(
	defineProps<
		PrimitiveProps & {
			variant?: ButtonVariants["variant"];
			size?: ButtonVariants["size"];
			loading?: boolean;
		}
	>(),
	{ variant: "default", size: "default" }
);
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const attrs = useAttrs();
const { forwardRef } = useForwardExpose();

function activate(event: MouseEvent) {
	if (props.loading || attrs["aria-disabled"] === true || attrs["aria-disabled"] === "true") {
		event.preventDefault();
		event.stopImmediatePropagation();
		return;
	}
	if (!event.defaultPrevented) emit("click", event);
}
</script>

<template>
	<Button
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		:variant="variant"
		:size="size"
		shape="pill"
		class="cn-alert-dialog-action"
		data-slot="alert-dialog-action"
		:data-loading="loading ? '' : undefined"
		:aria-busy="loading ? true : $attrs['aria-busy']"
		:aria-disabled="loading ? true : $attrs['aria-disabled']"
		@click="activate"
	>
		<slot />
	</Button>
</template>
