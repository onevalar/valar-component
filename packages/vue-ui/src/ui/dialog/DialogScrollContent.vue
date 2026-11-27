<script setup lang="ts">
import { IconPlaceholder } from "@/registry/bases/reka/components/icon-placeholder";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import DialogClose from "./DialogClose.vue";
import DialogContent from "./DialogContent.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		closeLabel?: string;
	}>(),
	{
		closeLabel: "关闭",
	}
);
</script>

<template>
	<DialogContent
		v-bind="$attrs"
		:show-close-button="false"
		:class="
			cn(
				'relative z-50 my-8 grid max-h-[calc(100dvh-2rem)] w-full max-w-lg gap-4 overflow-y-auto border border-border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full',
				props.class
			)
		"
	>
		<slot />
		<DialogClose
			class="absolute top-4 right-4 rounded-md p-0.5 transition-colors hover:bg-secondary"
		>
			<IconPlaceholder
				lucide="XIcon"
				tabler="IconX"
				hugeicons="Cancel01Icon"
				phosphor="XIcon"
				remixicon="RiCloseLine"
				class="h-4 w-4"
			/>
			<span class="sr-only">{{ closeLabel }}</span>
		</DialogClose>
	</DialogContent>
</template>
