<script setup lang="ts">
import { cn } from "cn";
import { DialogClose, useForwardExpose } from "reka-ui";
import { buttonVariants } from "../button/index.js";
import type { ButtonVariants } from "../button/index.js";
import type { DialogCloseProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<
		DialogCloseProps & {
			variant?: ButtonVariants["variant"];
			size?: ButtonVariants["size"];
			class?: HTMLAttributes["class"];
		}
	>(),
	{ variant: "outline", size: "default" }
);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<DialogClose
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		data-slot="alert-dialog-cancel"
		:data-variant="variant"
		:class="
			cn(buttonVariants({ variant, size, shape: 'pill' }), 'cn-alert-dialog-cancel', props.class)
		"
	>
		<slot />
	</DialogClose>
</template>
