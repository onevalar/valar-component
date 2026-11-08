<script lang="ts" setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { CalendarGrid, useForwardProps } from "reka-ui";
import type { CalendarGridProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<CalendarGridProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarGrid
		data-slot="calendar-grid"
		:class="cn('flex w-full border-collapse flex-col', props.class)"
		v-bind="forwardedProps"
	>
		<slot />
	</CalendarGrid>
</template>
