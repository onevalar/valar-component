<script setup lang="ts">
import { cn } from "cn";
import { DrawerContent, DrawerPortal } from "vaul-vue";
import { useAttrs } from "vue";
import DrawerOverlay from "./DrawerOverlay.vue";
import type { DrawerPortalProps } from "vaul-vue";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });
const props = defineProps<{ class?: HTMLAttributes["class"]; portalProps?: DrawerPortalProps }>();
const attrs = useAttrs();

function focusContent(event: Event) {
	// Vaul Vue intentionally cancels Reka's autofocus. Focus the dialog itself
	// for keyboard access without bringing up a mobile keyboard.
	if (!attrs.onOpenAutoFocus && event.target instanceof HTMLElement) {
		event.target.focus({ preventScroll: true });
	}
}
</script>

<template>
	<DrawerPortal v-bind="portalProps">
		<DrawerOverlay />
		<DrawerContent
			v-bind="$attrs"
			data-slot="drawer-content"
			@open-auto-focus="focusContent"
			:class="
				cn(
					'cn-drawer-content group/drawer-content fixed z-50 min-h-0 outline-hidden motion-reduce:animate-none! motion-reduce:transition-none!',
					'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh]',
					'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh]',
					'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm',
					'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm',
					props.class
				)
			"
		>
			<div
				aria-hidden="true"
				data-slot="drawer-handle"
				class="cn-drawer-handle mx-auto hidden shrink-0 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
			></div>
			<slot />
		</DrawerContent>
	</DrawerPortal>
</template>
