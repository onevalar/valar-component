<script lang="ts" setup>
import { IconPlaceholder } from "@/registry/bases/reka/components/icon-placeholder";
import { buttonVariants } from "@/registry/bases/reka/ui/button";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { RangeCalendarPrev, useForwardProps } from "reka-ui";
import type { RangeCalendarPrevProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<RangeCalendarPrevProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<RangeCalendarPrev
		data-slot="range-calendar-prev-button"
		:class="
			cn(
				buttonVariants({ variant: 'ghost' }),
				'pointer-events-auto size-(--cell-size) bg-transparent p-0 select-none disabled:opacity-50',
				props.class
			)
		"
		v-bind="forwardedProps"
	>
		<slot>
			<IconPlaceholder
				lucide="ChevronLeftIcon"
				tabler="IconChevronLeft"
				hugeicons="ArrowLeft01Icon"
				phosphor="CaretLeftIcon"
				remixicon="RiArrowLeftSLine"
				class="size-4"
			/>
		</slot>
	</RangeCalendarPrev>
</template>
