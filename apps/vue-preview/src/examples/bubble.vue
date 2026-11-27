<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@valar/vue-ui/button";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@valar/vue-ui/bubble";

const liked = ref(false);
</script>

<template>
	<BubbleGroup class="min-w-0 items-end pb-7">
		<Bubble variant="muted" align="end">
			<BubbleContent>Can we review the revised release notes?</BubbleContent>
		</Bubble>
		<Bubble variant="tinted" align="end">
			<BubbleContent>The new checklist is ready.</BubbleContent>
			<BubbleReactions side="bottom" align="end"><Button size="xs" variant="outline" :aria-pressed="liked" @click="liked = !liked">Like {{ liked ? 1 : 0 }}</Button></BubbleReactions>
		</Bubble>
	</BubbleGroup>
</template>
