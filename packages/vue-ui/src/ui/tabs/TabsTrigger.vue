<script setup lang="ts">
import { TabsTab as SdkTab } from "@ui-sdk/vue/tabs";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { TabsTriggerProps } from "reka-ui";
import { computed, inject, type HTMLAttributes } from "vue";
import ToggleTrigger from "../../lib/ToggleTrigger";
import { tabsContext, tabsValue } from "./context";

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
const context = inject(tabsContext, undefined);
const isDisabled = computed(() => Boolean(props.disabled || context?.disabled.value));
</script>

<template>
	<SdkTab :value="tabsValue(value)" :disabled="isDisabled" :class="cn(
		'cn-tabs-trigger relative inline-flex flex-1 group-data-horizontal/tabs:h-full items-center justify-center whitespace-nowrap text-foreground/60 transition-[border-color,background-color,color,opacity,box-shadow] group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:group-not-data-[variant=capsule]/tabs-list:text-muted-foreground dark:group-not-data-[variant=capsule]/tabs-list:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
		'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
		'data-active:bg-background data-active:text-foreground dark:group-not-data-[variant=capsule]/tabs-list:data-active:border-input dark:group-not-data-[variant=capsule]/tabs-list:data-active:bg-input/30 dark:group-not-data-[variant=capsule]/tabs-list:data-active:text-foreground',
		'after:pointer-events-none after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:end-0 group-data-vertical/tabs:after:w-0.5 motion-reduce:after:transition-none group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
		'cn-tabs-trigger-capsule', props.class)">
		<template #render="{ props: part, state }">
			<ToggleTrigger :ref="forwardRef" :as="as" :as-child="asChild"
				:part="{ ...part, ref: isDisabled ? undefined : part.ref, 'data-slot': 'tabs-trigger', disabled: isDisabled, 'data-active': state.selected ? '' : undefined, 'data-state': state.selected ? 'active' : 'inactive' }">
				<slot />
			</ToggleTrigger>
		</template>
	</SdkTab>
</template>
