<script setup lang="ts">
import { Avatar as SdkAvatar, type AvatarLoadingStatus } from "@ui-sdk/vue/avatar";
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import { provide, ref } from "vue";
import { avatarStatus } from "./context";
import type { AvatarRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<
		AvatarRootProps & {
			class?: HTMLAttributes["class"];
			size?: "default" | "sm" | "lg";
			appearance?: "default" | "subscriber" | "member";
		}
	>(),
	{ size: "default", appearance: "default" }
);
const { forwardRef } = useForwardExpose();
const status = ref<AvatarLoadingStatus>("idle");
provide(avatarStatus, status);
</script>

<template>
	<SdkAvatar
		:ref="forwardRef"
		data-slot="avatar"
		:data-size="size"
		:data-appearance="appearance"
		@loading-status-change="status = $event"
		:class="
			cn(
				'cn-avatar group/avatar relative flex shrink-0 select-none after:pointer-events-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten',
				appearance === 'subscriber' && 'cn-avatar-subscriber',
				appearance === 'member' && 'cn-avatar-member',
				props.class
			)
		"
	>
		<template v-if="asChild || (as && as !== 'span')" #render="{ props: partProps }">
			<Primitive :as="as ?? 'span'" :as-child="asChild" v-bind="partProps"><slot /></Primitive>
		</template>
		<slot />
	</SdkAvatar>
</template>
