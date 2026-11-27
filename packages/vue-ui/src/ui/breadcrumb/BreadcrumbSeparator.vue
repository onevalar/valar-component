<script setup lang="ts">
import { ChevronRightIcon } from "@lucide/vue";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<li
		data-slot="breadcrumb-separator"
		:data-default="$slots.default ? undefined : ''"
		role="presentation"
		aria-hidden="true"
		:class="cn('cn-breadcrumb-separator', props.class)"
	>
		<slot><ChevronRightIcon aria-hidden="true" class="cn-rtl-flip" /></slot>
	</li>
</template>
