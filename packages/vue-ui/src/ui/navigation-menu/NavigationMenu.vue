<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { NavigationMenuRoot, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import NavigationMenuViewport from "./NavigationMenuViewport.vue";
import type {
	NavigationMenuRootEmits,
	NavigationMenuRootProps,
	NavigationMenuViewportProps,
} from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<
		NavigationMenuRootProps & {
			class?: HTMLAttributes["class"];
			viewport?: boolean;
			viewportProps?: NavigationMenuViewportProps;
		}
	>(),
	{ viewport: true }
);
const emit = defineEmits<NavigationMenuRootEmits>();
const forwarded = useForwardPropsEmits(
	reactiveOmit(props, "class", "viewport", "viewportProps"),
	emit
);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<NavigationMenuRoot
		:ref="forwardRef"
		v-slot="slotProps"
		v-bind="forwarded"
		data-slot="navigation-menu"
		:data-viewport="viewport"
		:class="
			cn(
				'cn-navigation-menu group/navigation-menu relative flex flex-1 items-center justify-center',
				props.class
			)
		"
	>
		<slot v-bind="slotProps" />
		<NavigationMenuViewport v-if="viewport && !asChild" v-bind="viewportProps" />
	</NavigationMenuRoot>
</template>
