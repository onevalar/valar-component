<script setup lang="ts">
import { DialogDescription as SdkDescription } from "@ui-sdk/vue/dialog";
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
	<SdkDescription
		v-bind="$attrs"
		data-slot="dialog-description"
		:class="cn('cn-dialog-description', props.class)"
	>
		<template #render="{ props: part }">
			<DisclosureElement :as="props.as ?? 'p'" :as-child="props.asChild" :part="part">
				<slot />
			</DisclosureElement>
		</template>
	</SdkDescription>
</template>
