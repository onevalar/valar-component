<script setup lang="ts">
import { PopoverClose as SdkClose } from "@ui-sdk/vue/popover";
import type { Component, HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

const props = defineProps<{
	as?: string | Component;
	asChild?: boolean;
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<SdkClose data-slot="popover-close" :class="props.class">
		<template #render="{ props: part }">
			<DisclosureElement :as="props.as ?? 'button'" :as-child="props.asChild" :part="part">
				<slot />
			</DisclosureElement>
		</template>
	</SdkClose>
</template>
