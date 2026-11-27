<script setup lang="ts">
import { NavigationMenuViewport, useForwardExpose } from "reka-ui";
import type { NavigationMenuViewportProps } from "reka-ui";

const props = defineProps<NavigationMenuViewportProps>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<NavigationMenuViewport
		:ref="forwardRef"
		v-bind="props"
		data-slot="navigation-menu-viewport"
		class="cn-navigation-menu-viewport absolute top-full left-(--reka-navigation-menu-viewport-left) isolate z-50 mt-1.5 h-(--reka-navigation-menu-viewport-height) w-(--reka-navigation-menu-viewport-width) max-w-[calc(100dvw-20px)] origin-top overflow-hidden data-[orientation=vertical]:top-(--reka-navigation-menu-viewport-top) data-[orientation=vertical]:left-full"
	>
		<slot />
	</NavigationMenuViewport>
</template>
