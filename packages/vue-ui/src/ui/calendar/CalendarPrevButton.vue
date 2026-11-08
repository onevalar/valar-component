<script lang="ts" setup>
import { IconPlaceholder } from "@/registry/bases/reka/components/icon-placeholder";
import { buttonVariants } from "@/registry/bases/reka/ui/button";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { CalendarPrev, useForwardProps } from "reka-ui";
import type { CalendarPrevProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<CalendarPrevProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarPrev
		data-slot="calendar-prev-button"
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
				class="cn-rtl-flip size-4"
			/>
		</slot>
	</CalendarPrev>
</template>
