<script setup lang="ts">
import { CollapsiblePanel as SdkPanel } from "@ui-sdk/vue/collapsible";
import { cn } from "cn";
import type { CollapsibleContentEmits, CollapsibleContentProps } from "reka-ui";
import { inject, type HTMLAttributes, type Ref } from "vue";
import DisclosureElement from "./DisclosureElement";

const props = defineProps<CollapsibleContentProps & { class?: HTMLAttributes["class"] }>();
const emit = defineEmits<CollapsibleContentEmits>();
const unmountOnHide = inject<Readonly<Ref<boolean>>>("valar-collapsible-unmount");
</script>

<template>
	<SdkPanel keep-mounted :hidden-until-found="!unmountOnHide && !forceMount" :class="cn(props.class)"
		:style="{ '--reka-collapsible-content-height': 'var(--collapsible-panel-height)', '--reka-collapsible-content-width': 'var(--collapsible-panel-width)' }"
		@beforematch="emit('contentFound')">
		<template #render="{ props: part, state }">
			<DisclosureElement :as="as ?? 'div'" :as-child="asChild"
				:part="{ ...part, 'data-slot': 'collapsible-content', 'data-state': state.open ? 'open' : 'closed', hidden: forceMount ? undefined : part.hidden }">
				<slot v-if="forceMount || !unmountOnHide || part.hidden === undefined" />
			</DisclosureElement>
		</template>
	</SdkPanel>
</template>
