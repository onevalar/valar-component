<script setup lang="ts">
import { cn } from "cn";
import type { MessageAlign } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{ class?: HTMLAttributes["class"]; align?: MessageAlign }>(),
	{ align: "start" }
);
</script>

<template>
	<div
		data-slot="message"
		:data-align="align"
		:class="
			cn(
				'cn-message group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
