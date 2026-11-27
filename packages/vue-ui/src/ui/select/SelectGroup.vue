<script setup lang="ts">
import { SelectGroup as SdkGroup } from "@ui-sdk/vue/select";
import { cn } from "cn";
import { provide, type HTMLAttributes } from "vue";
import { SELECT_GROUP_KEY } from "./context";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
provide(SELECT_GROUP_KEY, true);
</script>

<template>
	<SdkGroup data-slot="select-group" :class="cn('cn-select-group', props.class)">
		<slot />
	</SdkGroup>
</template>
