<script setup lang="ts">
import { Collapsible as SdkRoot } from "@ui-sdk/vue/collapsible";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { CollapsibleRootEmits, CollapsibleRootProps } from "reka-ui";
import { provide, toRef } from "vue";
import type { HTMLAttributes } from "vue";
import DisclosureElement from "./DisclosureElement";

const props = withDefaults(defineProps<CollapsibleRootProps & {
	class?: HTMLAttributes["class"];
	appearance?: "default" | "properties";
}>(), { appearance: "default", open: undefined, unmountOnHide: false });
const emit = defineEmits<CollapsibleRootEmits>();
const { forwardRef } = useForwardExpose();
provide("valar-collapsible-unmount", toRef(props, "unmountOnHide"));
</script>

<template>
	<SdkRoot :open="open" :default-open="defaultOpen" :disabled="disabled" @update:open="emit('update:open', $event)"
		data-slot="collapsible" :data-appearance="appearance"
		:class="cn(appearance === 'properties' && 'cn-collapsible-properties', props.class)">
		<template #render="{ props: part, state }">
			<DisclosureElement :ref="forwardRef" :as="as ?? 'div'" :as-child="asChild" :part="{ ...part, 'data-state': state.open ? 'open' : 'closed' }">
				<slot :open="state.open" />
			</DisclosureElement>
		</template>
	</SdkRoot>
</template>
