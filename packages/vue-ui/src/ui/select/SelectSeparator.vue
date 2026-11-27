<script setup lang="ts">
import { SelectSeparator as SdkSeparator } from "@ui-sdk/vue/select";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<SdkSeparator
		data-slot="select-separator"
		:class="cn('cn-select-separator pointer-events-none h-[0.5px] bg-border', props.class)"
	/>
</template>
