<script setup lang="ts">
import { SelectGroupLabel as SdkGroupLabel } from "@ui-sdk/vue/select";
import { cn } from "cn";
import { inject, type HTMLAttributes } from "vue";
import { SELECT_GROUP_KEY } from "./context";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const inGroup = inject(SELECT_GROUP_KEY, false);
</script>

<template>
	<SdkGroupLabel v-if="inGroup" data-slot="select-label" :class="cn('cn-select-label', props.class)">
		<slot />
	</SdkGroupLabel>
	<div v-else data-slot="select-label" :class="cn('cn-select-label', props.class)">
		<slot />
	</div>
</template>
