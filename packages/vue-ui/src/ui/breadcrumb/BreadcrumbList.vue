<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<ol
		data-slot="breadcrumb-list"
		:class="cn('cn-breadcrumb-list flex flex-wrap items-center wrap-break-word', props.class)"
	>
		<slot />
	</ol>
</template>
