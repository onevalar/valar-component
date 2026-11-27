<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { RadioGroupIndicator, RadioGroupItem, useForwardExpose, useForwardProps } from "reka-ui";
import type { RadioGroupItemEmits, RadioGroupItemProps } from "reka-ui";
import { inject, type HTMLAttributes } from "vue";
import { radioGroupReadonly } from "./context";

const props = defineProps<Omit<RadioGroupItemProps, "value"> & { class?: HTMLAttributes["class"]; value: string }>();
const emit = defineEmits<RadioGroupItemEmits>();
const forwarded = useForwardProps(reactiveOmit(props, "class"));
const { forwardRef } = useForwardExpose();
const readonly = inject(radioGroupReadonly, undefined);

function select(event: RadioGroupItemEmits["select"][0]) {
	if (readonly?.value) event.preventDefault();
	emit("select", event);
}
</script>

<template>
	<RadioGroupItem :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="radio-group-item" :data-readonly="readonly ? '' : undefined"
		:class="cn('cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50', props.class)" @select="select">
		<slot v-bind="state">
			<RadioGroupIndicator force-mount data-slot="radio-group-indicator" class="cn-radio-group-indicator" aria-hidden="true">
				<span v-if="state.checked" class="cn-radio-group-indicator-icon" />
			</RadioGroupIndicator>
		</slot>
	</RadioGroupItem>
</template>
