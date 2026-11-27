<script setup lang="ts">
import { TabsPanel as SdkPanel } from "@ui-sdk/vue/tabs";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { TabsContentProps } from "reka-ui";
import { inject, type HTMLAttributes } from "vue";
import ToggleTrigger from "../../lib/ToggleTrigger";
import { tabsContext, tabsValue } from "./context";

const props = defineProps<TabsContentProps & { class?: HTMLAttributes["class"] }>();
const { forwardRef } = useForwardExpose();
const context = inject(tabsContext, undefined);
</script>

<template>
	<SdkPanel :value="tabsValue(value)" :keep-mounted="forceMount || !context?.unmountOnHide.value" tabindex="0"
		:class="cn('cn-tabs-content min-w-0 flex-1 outline-none', props.class)">
		<template #render="{ props: part, state }">
			<ToggleTrigger :ref="forwardRef" :as="as ?? 'div'" :as-child="asChild"
				:part="{ ...part, 'data-slot': 'tabs-content', 'data-state': state.selected ? 'active' : 'inactive', hidden: !state.selected || part.hidden }">
				<slot />
			</ToggleTrigger>
		</template>
	</SdkPanel>
</template>
