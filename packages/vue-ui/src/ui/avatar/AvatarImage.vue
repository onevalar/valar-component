<script setup lang="ts">
import { AvatarImage as SdkImage } from "@ui-sdk/vue/avatar";
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import { inject, watch } from "vue";
import { avatarStatus } from "./context";
import type { AvatarImageEmits, AvatarImageProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<
		Omit<AvatarImageProps, "src"> & {
			class?: HTMLAttributes["class"];
			src?: string;
			alt: string;
		}
	>(),
	{ src: "" }
);
const emit = defineEmits<AvatarImageEmits>();
const { forwardRef } = useForwardExpose();
const status = inject(avatarStatus);
if (status)
	watch(status, (value) => emit("loadingStatusChange", value), { immediate: true, flush: "sync" });
</script>

<template>
	<SdkImage
		:ref="forwardRef"
		:src="src || undefined"
		:alt="alt"
		:referrerpolicy="referrerPolicy"
		:crossorigin="crossOrigin"
		data-slot="avatar-image"
		:class="cn('cn-avatar-image aspect-square size-full object-cover', props.class)"
	>
		<template v-if="asChild || (as && as !== 'img')" #render="{ props: partProps }">
			<Primitive :as="as ?? 'img'" :as-child="asChild" v-bind="partProps"><slot /></Primitive>
		</template>
	</SdkImage>
</template>
