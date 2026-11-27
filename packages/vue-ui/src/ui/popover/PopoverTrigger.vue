<script setup lang="ts">
import { PopoverTrigger as SdkTrigger, type PopoverController } from "@ui-sdk/vue/popover";
import type { Component, HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

const props = defineProps<{
	as?: string | Component;
	asChild?: boolean;
	disabled?: boolean;
	focusableWhenDisabled?: boolean;
	payload?: unknown;
	shortcut?: string;
	controller?: PopoverController<unknown>;
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<SdkTrigger
		data-slot="popover-trigger"
		:disabled="props.disabled"
		:focusable-when-disabled="props.focusableWhenDisabled"
		:payload="props.payload"
		:shortcut="props.shortcut"
		:controller="props.controller"
		:class="props.class"
	>
		<template #render="{ props: part, state }">
			<DisclosureElement
				:as="props.as ?? 'button'"
				:as-child="props.asChild"
				:part="{ ...part, 'data-state': state.open ? 'open' : 'closed' }"
			>
				<slot />
			</DisclosureElement>
		</template>
	</SdkTrigger>
</template>
