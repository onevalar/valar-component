<script setup lang="ts">
import { cn } from "cn";
import { attachmentMediaVariants, type AttachmentMediaVariant } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{ class?: HTMLAttributes["class"]; variant?: AttachmentMediaVariant }>(),
	{ variant: "icon" }
);
</script>

<template>
	<div
		data-slot="attachment-media"
		:data-variant="variant"
		:class="cn(attachmentMediaVariants({ variant }), props.class)"
	>
		<slot />
	</div>
</template>
