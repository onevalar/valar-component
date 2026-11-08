<script setup lang="ts">
import { Button } from "@/registry/bases/reka/ui/button";
import { cn } from "cn";
import { DialogClose } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		showCloseButton?: boolean;
		closeLabel?: string;
	}>(),
	{
		showCloseButton: false,
		closeLabel: "关闭",
	}
);
</script>

<template>
	<div
		data-slot="dialog-footer"
		:class="
			cn('cn-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', props.class)
		"
	>
		<slot />
		<DialogClose v-if="showCloseButton" as-child>
			<Button variant="outline">
				{{ closeLabel }}
			</Button>
		</DialogClose>
	</div>
</template>
