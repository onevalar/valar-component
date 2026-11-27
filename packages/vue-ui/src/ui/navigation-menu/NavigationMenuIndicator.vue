<script setup lang="ts">
import { NavigationMenuIndicator, useForwardExpose } from "reka-ui";
import type { NavigationMenuIndicatorProps } from "reka-ui";

const props = defineProps<NavigationMenuIndicatorProps>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<NavigationMenuIndicator
		:ref="forwardRef"
		v-bind="props"
		data-slot="navigation-menu-indicator"
		class="cn-navigation-menu-indicator top-full z-1 flex h-1.5 items-end justify-center overflow-hidden"
	>
		<slot>
			<div class="cn-navigation-menu-indicator-arrow relative top-[60%] size-2 rotate-45" />
		</slot>
	</NavigationMenuIndicator>
</template>
