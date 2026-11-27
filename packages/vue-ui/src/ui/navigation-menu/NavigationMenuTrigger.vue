<script setup lang="ts">
import { ChevronDownIcon } from "@lucide/vue";
import { NavigationMenuTrigger, useForwardExpose } from "reka-ui";
import { navigationMenuTriggerStyle } from "./index.js";
import type { NavigationMenuTriggerProps } from "reka-ui";

const props = defineProps<NavigationMenuTriggerProps>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<NavigationMenuTrigger
		:ref="forwardRef"
		v-bind="props"
		data-slot="navigation-menu-trigger"
		:class="navigationMenuTriggerStyle()"
	>
		<slot />
		<ChevronDownIcon
			v-if="!asChild"
			aria-hidden="true"
			class="cn-navigation-menu-trigger-icon group-data-[state=open]/navigation-menu-trigger:rotate-180"
		/>
	</NavigationMenuTrigger>
</template>
