<script lang="ts" setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { CalendarHeader, useForwardProps } from "reka-ui";
import type { CalendarHeaderProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<CalendarHeaderProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarHeader
		data-slot="calendar-header"
		:class="
			cn(
				'relative flex h-(--cell-size) w-full items-center justify-center gap-1.5 px-(--cell-size) text-sm font-medium',
				props.class
			)
		"
		v-bind="forwardedProps"
	>
		<slot />
	</CalendarHeader>
</template>
