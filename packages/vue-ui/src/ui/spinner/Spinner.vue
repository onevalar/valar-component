<script setup lang="ts">
import { LoaderCircleIcon } from "@lucide/vue";
import { cn } from "cn";
import { computed } from "vue";
import type { SVGAttributes } from "vue";

const props = defineProps<{ class?: SVGAttributes["class"] }>();
const explicitSize = computed(() => /(?:^|\s)(?:\S+:)?!?(?:size|w|h)-/.test(cn(props.class)));
</script>

<template>
	<LoaderCircleIcon
		role="status"
		aria-label="加载中"
		data-slot="spinner"
		:data-spinner-size-explicit="explicitSize ? '' : undefined"
		:class="cn('cn-spinner size-4 motion-safe:animate-spin', props.class)"
	/>
</template>
