<script lang="ts" setup>
import { buttonVariants } from "@/registry/bases/reka/ui/button";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { CalendarCellTrigger, useForwardProps } from "reka-ui";
import type { CalendarCellTriggerProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes["class"] }>(),
	{
		as: "button",
	}
);

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarCellTrigger
		data-slot="calendar-cell-trigger"
		:class="
			cn(
				buttonVariants({ variant: 'ghost' }),
				'cn-calendar-day size-(--cell-size) cursor-default rounded-(--cell-radius) p-0 font-normal data-outside-view:not-data-selected:text-(color:--calendar-date-muted) data-unavailable:line-through data-disabled:opacity-50',
				props.class
			)
		"
		v-bind="forwardedProps"
	>
		<slot />
	</CalendarCellTrigger>
</template>
