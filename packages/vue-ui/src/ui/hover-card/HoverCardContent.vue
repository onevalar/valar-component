<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { HoverCardContent, HoverCardPortal, useForwardExpose, useForwardProps } from "reka-ui";
import type { HoverCardContentProps, HoverCardPortalProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<
		HoverCardContentProps & {
			class?: HTMLAttributes["class"];
			appearance?: "default" | "profile";
			portalProps?: HoverCardPortalProps;
		}
	>(),
	{ align: "center", side: "bottom", sideOffset: 4, collisionPadding: 8, appearance: "default" }
);
const forwarded = useForwardProps(reactiveOmit(props, "class", "appearance", "portalProps"));
const { forwardRef } = useForwardExpose();
</script>

<template>
	<HoverCardPortal v-bind="portalProps">
		<HoverCardContent
			:ref="forwardRef"
			v-bind="{ ...$attrs, ...forwarded }"
			data-slot="hover-card-content"
			:data-appearance="appearance"
			:class="
				cn(
					'cn-hover-card-content z-50 origin-(--reka-hover-card-content-transform-origin) outline-hidden',
					appearance === 'profile' && 'cn-hover-card-profile',
					props.class
				)
			"
		>
			<slot />
		</HoverCardContent>
	</HoverCardPortal>
</template>
