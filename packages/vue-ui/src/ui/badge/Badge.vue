<script setup lang="ts">
import { cn } from "cn";
import { badgeVariants, type BadgeVariant } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		variant?: BadgeVariant;
		href?: string;
		labelColor?: string;
	}>(),
	{ variant: "default" }
);
</script>

<template>
	<component
		:is="href ? 'a' : 'span'"
		data-slot="badge"
		:href="href"
		:class="cn(badgeVariants({ variant }), props.class)"
	>
		<span
			v-if="variant === 'label' && labelColor"
			aria-hidden="true"
			data-slot="badge-label-marker"
			class="grid size-3.5 shrink-0 place-items-center before:size-[9px] before:rounded-full before:bg-current"
			:style="{ color: labelColor }"
		/>
		<slot />
	</component>
</template>
