<script lang="ts" setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { RangeCalendarHeadCell, useForwardProps } from "reka-ui";
import type { RangeCalendarHeadCellProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<RangeCalendarHeadCellProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<RangeCalendarHeadCell
		data-slot="range-calendar-head-cell"
		:class="
			cn('w-(--cell-size) rounded-md text-[0.8rem] font-normal text-muted-foreground', props.class)
		"
		v-bind="forwardedProps"
	>
		<slot />
	</RangeCalendarHeadCell>
</template>
