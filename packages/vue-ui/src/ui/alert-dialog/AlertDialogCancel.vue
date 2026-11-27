<script setup lang="ts">
import { AlertDialogClose as SdkClose } from "@ui-sdk/vue/alert-dialog";
import { cn } from "cn";
import type { Component, HTMLAttributes } from "vue";
import { buttonVariants, type ButtonVariants } from "../button/index.js";
import DisclosureElement from "../collapsible/DisclosureElement";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		variant?: ButtonVariants["variant"];
		size?: ButtonVariants["size"];
		class?: HTMLAttributes["class"];
	}>(),
	{ variant: "outline", size: "default" }
);
</script>

<template>
	<SdkClose
		v-bind="$attrs"
		data-slot="alert-dialog-cancel"
		:data-variant="variant"
		:class="
			cn(buttonVariants({ variant, size, shape: 'pill' }), 'cn-alert-dialog-cancel', props.class)
		"
	>
		<template #render="{ props: part }">
			<DisclosureElement
				:as="props.as ?? 'button'"
				:as-child="props.asChild"
				:part="{ ...part, 'data-slot': 'alert-dialog-cancel' }"
			>
				<slot />
			</DisclosureElement>
		</template>
	</SdkClose>
</template>
