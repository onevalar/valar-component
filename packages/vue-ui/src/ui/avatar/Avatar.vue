<script setup lang="ts">
import { cn } from "cn";
import { AvatarRoot, useForwardExpose } from "reka-ui";
import type { AvatarRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<AvatarRootProps & {
	class?: HTMLAttributes["class"];
	size?: "default" | "sm" | "lg";
	appearance?: "default" | "subscriber" | "member";
}>(), { size: "default", appearance: "default" });
const { forwardRef } = useForwardExpose();
</script>

<template>
	<AvatarRoot :ref="forwardRef" :as="as" :as-child="asChild" data-slot="avatar" :data-size="size" :data-appearance="appearance"
		:class="cn('cn-avatar group/avatar relative flex shrink-0 select-none after:pointer-events-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten', appearance === 'subscriber' && 'cn-avatar-subscriber', appearance === 'member' && 'cn-avatar-member', props.class)">
		<slot />
	</AvatarRoot>
</template>
