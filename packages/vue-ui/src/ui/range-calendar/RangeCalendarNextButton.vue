<script lang="ts" setup>
import { IconPlaceholder } from "@/registry/bases/reka/components/icon-placeholder";
import { buttonVariants } from "@/registry/bases/reka/ui/button";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { RangeCalendarNext, useForwardProps } from "reka-ui";
import type { RangeCalendarNextProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<RangeCalendarNextProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<RangeCalendarNext
		data-slot="range-calendar-next-button"
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
				lucide="ChevronRightIcon"
				tabler="IconChevronRight"
				hugeicons="ArrowRight01Icon"
				phosphor="CaretRightIcon"
				remixicon="RiArrowRightSLine"
				class="size-4"
			/>
		</slot>
	</RangeCalendarNext>
</template>
