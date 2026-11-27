<script setup lang="ts">
import { AccordionHeader as SdkHeader, AccordionTrigger as SdkTrigger } from "@ui-sdk/vue/accordion";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { AccordionTriggerProps } from "reka-ui";
import { inject, watch, type HTMLAttributes, type Ref } from "vue";
import Icon from "../../lib/Icon.vue";
import DisclosureElement from "../collapsible/DisclosureElement";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<AccordionTriggerProps & {
	class?: HTMLAttributes["class"];
	id?: string;
	level?: 1 | 2 | 3 | 4 | 5 | 6;
}>(), { level: 3 });
const { forwardRef } = useForwardExpose();
const orientation = inject<Readonly<Ref<string>>>("valar-accordion-orientation");
const triggerId = inject<Ref<string | undefined>>("valar-accordion-trigger-id");
// Core links the region to its generated ID. Keep that link with the legacy id prop.
if (triggerId) watch(() => props.id, (id) => { triggerId.value = id; }, { immediate: true });
</script>

<template>
	<SdkHeader class="flex" :data-orientation="orientation">
		<template #render="{ props: heading, state: headerState }">
			<component :is="`h${level}`" v-bind="heading" :data-state="headerState.open ? 'open' : 'closed'">
				<SdkTrigger v-bind="$attrs" data-slot="accordion-trigger" :data-orientation="orientation"
					:class="cn('cn-accordion-trigger group/accordion-trigger relative flex min-w-0 flex-1 items-start justify-between border border-transparent outline-none disabled:pointer-events-none disabled:opacity-50', props.class)">
					<template #render="{ props: part, state }">
						<DisclosureElement :ref="forwardRef" :as="as ?? 'button'" :as-child="asChild"
							:part="{ ...part, id: id ?? part.id, disabled: state.disabled, 'data-state': state.open ? 'open' : 'closed' }">
							<slot />
							<template v-if="!asChild && as !== 'template'">
								<Icon lucide="ChevronDownIcon" data-slot="accordion-trigger-icon" class="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
								<Icon lucide="ChevronUpIcon" data-slot="accordion-trigger-icon" class="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
							</template>
						</DisclosureElement>
					</template>
				</SdkTrigger>
			</component>
		</template>
	</SdkHeader>
</template>
