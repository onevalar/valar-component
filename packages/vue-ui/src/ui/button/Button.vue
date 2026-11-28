<script setup lang="ts">
import { Button as SdkButton } from "@ui-sdk/vue/button";
import { cn } from "cn";
import { Primitive } from "reka-ui";
import { computed, useAttrs } from "vue";
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
const attrs = useAttrs();
const slot = computed(() => (attrs["data-slot"] as string | undefined) ?? "button");
const element = computed(() => (props.href ? "a" : props.as));
</script>

<template>
	<SdkButton
		v-if="element === 'button' && !asChild"
		:data-slot="slot"
		:data-variant="variant"
		:data-size="size"
		:type="type"
		:disabled="disabled"
		:class="cn(buttonVariants({ variant, size, shape }), props.class)"
	>
		<template #render="{ props: buttonProps }">
			<button v-bind="buttonProps" :data-slot="slot">
				<slot />
			</button>
		</template>
	</SdkButton>
	<Primitive
		v-else
		:data-slot="slot"
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
