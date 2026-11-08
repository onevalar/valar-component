<script setup lang="ts">
import { cn } from "cn";
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { buttonVariants } from ".";
import type { ButtonVariants } from ".";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

interface Props extends PrimitiveProps {
	variant?: ButtonVariants["variant"];
	size?: ButtonVariants["size"];
	shape?: ButtonVariants["shape"];
	href?: string;
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
	class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
	as: "button",
	type: "button",
	shape: "auto",
	variant: "default",
	size: "default",
});
const element = computed(() => (props.href ? "a" : props.as));
</script>

<template>
	<Primitive
		data-slot="button"
		:data-variant="variant"
		:data-size="size"
		:as="element"
		:as-child="asChild"
		:type="element === 'button' ? type : undefined"
		:href="disabled ? undefined : href"
		:disabled="element === 'button' ? disabled : undefined"
		:aria-disabled="element === 'a' ? disabled : undefined"
		:role="element === 'a' && disabled ? 'link' : undefined"
		:tabindex="disabled ? -1 : undefined"
		:class="cn(buttonVariants({ variant, size, shape }), props.class)"
	>
		<slot />
	</Primitive>
</template>
