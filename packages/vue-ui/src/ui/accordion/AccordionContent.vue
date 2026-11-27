<script setup lang="ts">
import { AccordionPanel as SdkPanel } from "@ui-sdk/vue/accordion";
import { cn } from "cn";
import type { AccordionContentProps } from "reka-ui";
import { inject, type HTMLAttributes, type Ref } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

const props = defineProps<Omit<AccordionContentProps, "asChild"> & { class?: HTMLAttributes["class"] }>();
const orientation = inject<Readonly<Ref<string>>>("valar-accordion-orientation");
const unmountOnHide = inject<Readonly<Ref<boolean>>>("valar-accordion-unmount");
const triggerId = inject<Readonly<Ref<string | undefined>>>("valar-accordion-trigger-id");
</script>

<template>
	<SdkPanel keep-mounted :hidden-until-found="!unmountOnHide && !forceMount" :data-orientation="orientation"
		class="cn-accordion-content overflow-hidden motion-reduce:animate-none!"
		:style="{ '--reka-accordion-content-height': 'var(--accordion-panel-height)', '--reka-accordion-content-width': 'var(--accordion-panel-width)', '--bits-accordion-content-height': 'var(--accordion-panel-height)' }">
		<template #render="{ props: part, state }">
			<DisclosureElement :as="as ?? 'div'"
				:part="{ ...part, 'aria-labelledby': triggerId ?? part['aria-labelledby'], 'data-slot': 'accordion-content', 'data-state': state.open ? 'open' : 'closed', hidden: forceMount ? undefined : part.hidden }">
				<div v-if="forceMount || !unmountOnHide || part.hidden === undefined"
					:class="cn('cn-accordion-content-inner [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4', props.class)">
					<slot />
				</div>
			</DisclosureElement>
		</template>
	</SdkPanel>
</template>
