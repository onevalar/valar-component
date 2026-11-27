<script setup lang="ts">
import { cn } from "cn";
import { AvatarFallback, useForwardExpose } from "reka-ui";
import type { AvatarFallbackProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<AvatarFallbackProps & { class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<AvatarFallback :ref="forwardRef" :as="as" :as-child="asChild" :delay-ms="delayMs || undefined" data-slot="avatar-fallback"
		:class="cn('cn-avatar-fallback flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs', props.class)">
		<slot />
	</AvatarFallback>
</template>
