<script setup lang="ts">
import { CollapsibleTrigger as SdkTrigger } from "@ui-sdk/vue/collapsible";
import { cn } from "cn";
import type { CollapsibleTriggerProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import DisclosureElement from "./DisclosureElement";

const props = defineProps<CollapsibleTriggerProps & { class?: HTMLAttributes["class"] }>();
</script>

<template>
	<SdkTrigger data-slot="collapsible-trigger" :class="cn('cn-collapsible-trigger focus-visible:outline-solid', props.class)">
		<template #render="{ props: part, state }">
			<DisclosureElement :as="as ?? 'button'" :as-child="asChild"
				:part="{ ...part, disabled: state.disabled || part.disabled, 'data-state': state.open ? 'open' : 'closed' }">
				<slot />
			</DisclosureElement>
		</template>
	</SdkTrigger>
</template>
