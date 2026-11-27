<script setup lang="ts">
import { AvatarFallback as SdkFallback } from "@ui-sdk/vue/avatar";
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import type { AvatarFallbackProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<AvatarFallbackProps & { class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<SdkFallback
		:ref="forwardRef"
		:delay="delayMs || undefined"
		data-slot="avatar-fallback"
		:class="
			cn(
				'cn-avatar-fallback flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs',
				props.class
			)
		"
	>
		<template v-if="asChild || (as && as !== 'span')" #render="{ props: partProps }">
			<Primitive :as="as ?? 'span'" :as-child="asChild" v-bind="partProps"><slot /></Primitive>
		</template>
		<slot />
	</SdkFallback>
</template>
