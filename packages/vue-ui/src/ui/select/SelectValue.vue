<script setup lang="ts">
import { SelectValue as SdkValue } from "@ui-sdk/vue/select";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	placeholder?: string;
	maxLabels?: number;
	getMoreLabel?: (count: number) => string;
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<SdkValue
		:placeholder="props.placeholder"
		:max-labels="props.maxLabels"
		:get-more-label="props.getMoreLabel"
		data-slot="select-value"
		:class="cn('truncate text-start', props.class)"
	>
		<template #render="{ props: part, state }">
			<span v-bind="part">
				<slot>{{ state.placeholder ? (props.placeholder ?? "") : state.label }}</slot>
			</span>
		</template>
	</SdkValue>
</template>
