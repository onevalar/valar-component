<script setup lang="ts">
import { Minus } from "@lucide/vue";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="input-otp-separator"
		role="separator"
		aria-hidden="true"
		:class="cn('cn-input-otp-separator flex items-center', props.class)"
	>
		<slot><Minus class="size-4" /></slot>
	</div>
</template>
