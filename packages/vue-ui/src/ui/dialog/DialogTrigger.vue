<script setup lang="ts">
import { DialogTrigger as SdkTrigger, type DialogController } from "@ui-sdk/vue/dialog";
import type { Component } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		disabled?: boolean;
		focusableWhenDisabled?: boolean;
		payload?: unknown;
		shortcut?: string;
		controller?: DialogController<unknown, unknown>;
	}>(),
	{
		disabled: undefined,
		focusableWhenDisabled: undefined,
	}
);
</script>

<template>
	<SdkTrigger
		v-bind="$attrs"
		:disabled="props.disabled"
		:focusable-when-disabled="props.focusableWhenDisabled"
		:payload="props.payload"
		:shortcut="props.shortcut"
		:controller="props.controller"
		data-slot="dialog-trigger"
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
