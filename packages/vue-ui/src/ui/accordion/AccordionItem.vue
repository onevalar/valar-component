<script setup lang="ts">
import { AccordionItem as SdkItem } from "@ui-sdk/vue/accordion";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { AccordionItemProps } from "reka-ui";
import { computed, inject, provide, shallowRef, type HTMLAttributes, type Ref } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

const props = withDefaults(defineProps<AccordionItemProps & { class?: HTMLAttributes["class"] }>(), { unmountOnHide: undefined });
const { forwardRef } = useForwardExpose();
const orientation = inject<Readonly<Ref<string>>>("valar-accordion-orientation");
const rootUnmount = inject<Readonly<Ref<boolean>>>("valar-accordion-unmount");
provide("valar-accordion-unmount", computed(() => props.unmountOnHide ?? rootUnmount?.value));
provide("valar-accordion-trigger-id", shallowRef<string>());
</script>

<template>
	<SdkItem :value="value" :disabled="disabled" data-slot="accordion-item" :data-orientation="orientation"
		:class="cn('cn-accordion-item', props.class)">
		<template #render="{ props: part, state }">
			<DisclosureElement :ref="forwardRef" :as="as ?? 'div'" :as-child="asChild" :part="{ ...part, 'data-state': state.open ? 'open' : 'closed' }">
				<slot :open="state.open" />
			</DisclosureElement>
		</template>
	</SdkItem>
</template>
