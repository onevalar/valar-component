<script lang="ts" setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { CalendarCell, useForwardProps } from "reka-ui";
import type { CalendarCellProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<CalendarCellProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarCell
		data-slot="calendar-cell"
		:class="
			cn('relative size-(--cell-size) p-0 text-center text-sm focus-within:z-20', props.class)
		"
		v-bind="forwardedProps"
	>
		<slot />
	</CalendarCell>
</template>
