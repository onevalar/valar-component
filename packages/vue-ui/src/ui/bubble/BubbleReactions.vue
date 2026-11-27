<script setup lang="ts">
import { cn } from "cn";
import { bubbleReactionsVariants, type BubbleReactionsAlign, type BubbleReactionsSide } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		align?: BubbleReactionsAlign;
		side?: BubbleReactionsSide;
	}>(),
	{ align: "end", side: "bottom" }
);
</script>

<template>
	<div
		data-slot="bubble-reactions"
		:data-align="align"
		:data-side="side"
		:class="cn(bubbleReactionsVariants({ side, align }), props.class)"
	>
		<slot />
	</div>
</template>
