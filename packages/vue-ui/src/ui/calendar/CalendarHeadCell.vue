<script lang="ts" setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { CalendarHeadCell, useForwardProps } from "reka-ui";
import type { CalendarHeadCellProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<CalendarHeadCellProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarHeadCell
		data-slot="calendar-head-cell"
		:class="
			cn('w-(--cell-size) rounded-md text-[0.8rem] font-normal text-muted-foreground', props.class)
		"
		v-bind="forwardedProps"
	>
		<slot />
	</CalendarHeadCell>
</template>
