<script setup lang="ts">
import { DialogTitle as SdkTitle } from "@ui-sdk/vue/dialog";
import { cn } from "cn";
import type { Component, HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
	as?: string | Component;
	asChild?: boolean;
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<SdkTitle
		v-bind="$attrs"
		data-slot="dialog-title"
		:class="cn('cn-dialog-title cn-font-heading', props.class)"
	>
		<template #render="{ props: part }">
			<DisclosureElement :as="props.as ?? 'h2'" :as-child="props.asChild" :part="part">
				<slot />
			</DisclosureElement>
		</template>
	</SdkTitle>
</template>
