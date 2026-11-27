<script setup lang="ts">
import { cn } from "cn";
import { AvatarImage, useForwardExpose } from "reka-ui";
import type { AvatarImageEmits, AvatarImageProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<Omit<AvatarImageProps, "src"> & {
	class?: HTMLAttributes["class"];
	src?: string;
	alt: string;
}>(), { src: "" });
const emit = defineEmits<AvatarImageEmits>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<AvatarImage :ref="forwardRef" :as="as" :as-child="asChild" :src="src" :alt="alt"
		:referrer-policy="referrerPolicy" :cross-origin="crossOrigin" data-slot="avatar-image"
		:class="cn('cn-avatar-image aspect-square size-full object-cover', props.class)"
		@loading-status-change="emit('loadingStatusChange', $event)">
		<slot />
	</AvatarImage>
</template>
