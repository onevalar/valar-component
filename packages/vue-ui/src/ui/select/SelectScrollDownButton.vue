<script setup lang="ts">
import IconPlaceholder from "@/registry/bases/reka/components/icon-placeholder/IconPlaceholder.vue";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="select-scroll-down-button"
		aria-hidden="true"
		:class="cn('cn-select-scroll-down-button hidden', props.class)"
	>
		<slot>
			<IconPlaceholder
				lucide="ChevronDownIcon"
				tabler="IconChevronDown"
				hugeicons="ArrowDown01Icon"
				phosphor="CaretDownIcon"
				remixicon="RiArrowDownSLine"
			/>
		</slot>
	</div>
</template>
