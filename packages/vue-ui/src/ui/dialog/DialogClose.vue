<script setup lang="ts">
import { DialogClose as SdkClose } from "@ui-sdk/vue/dialog";
import type { ActionDetails } from "@ui-sdk/core";
import type { Component } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
	as?: string | Component;
	asChild?: boolean;
	value?: string;
	action?: (event: Event | undefined, details: ActionDetails) => unknown;
}>();
</script>

<template>
	<SdkClose v-bind="$attrs" :value="props.value" :action="props.action" data-slot="dialog-close">
		<template #render="{ props: part }">
			<DisclosureElement :as="props.as ?? 'button'" :as-child="props.asChild" :part="part">
				<slot />
			</DisclosureElement>
		</template>
	</SdkClose>
</template>
