<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { SelectSeparator } from "reka-ui";
import type { SelectSeparatorProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<SelectSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
	<SelectSeparator
		data-slot="select-separator"
		v-bind="delegatedProps"
		:class="cn('cn-select-separator pointer-events-none', props.class)"
	/>
</template>
