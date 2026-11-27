<script setup lang="ts">
import IconPlaceholder from "@/registry/bases/reka/components/icon-placeholder/IconPlaceholder.vue";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="select-scroll-up-button"
		aria-hidden="true"
		:class="cn('cn-select-scroll-up-button hidden', props.class)"
	>
		<slot>
			<IconPlaceholder
				lucide="ChevronUpIcon"
				tabler="IconChevronUp"
				hugeicons="ArrowUp01Icon"
				phosphor="CaretUpIcon"
				remixicon="RiArrowUpSLine"
			/>
		</slot>
	</div>
</template>
