<script setup lang="ts">
import { cn } from "cn";
import {
	attachmentVariants,
	type AttachmentOrientation,
	type AttachmentSize,
	type AttachmentState,
} from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		size?: AttachmentSize;
		orientation?: AttachmentOrientation;
		state?: AttachmentState;
	}>(),
	{ size: "default", orientation: "horizontal", state: "done" }
);
</script>

<template>
	<div
		data-slot="attachment"
		:data-size="size"
		:data-orientation="orientation"
		:data-state="state"
		:class="cn(attachmentVariants({ size, orientation }), props.class)"
	>
		<slot />
	</div>
</template>
