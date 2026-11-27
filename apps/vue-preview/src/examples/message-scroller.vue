<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@valar/vue-ui/button";
import { MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerRoot, MessageScrollerViewport } from "@valar/vue-ui/message-scroller";

const history = Array.from({ length: 7 }, (_, index) => `Earlier message ${index + 1}`);
const chunks = ref(0);
</script>

<template>
	<div class="grid min-w-0 gap-2">
		<Button class="w-fit" variant="outline" @click="chunks++">Append reply</Button>
		<MessageScrollerProvider auto-scroll>
			<MessageScrollerRoot class="h-56 rounded-lg border">
				<MessageScrollerViewport tabindex="0" role="region" aria-label="Transcript">
					<MessageScrollerContent class="p-3">
						<MessageScrollerItem v-for="text in history" :key="text" :message-id="text" class="rounded-md bg-muted p-2">{{ text }}</MessageScrollerItem>
						<MessageScrollerItem v-if="chunks" message-id="question" scroll-anchor class="rounded-md bg-muted p-2">What changed this week?</MessageScrollerItem>
						<MessageScrollerItem v-if="chunks" message-id="reply"><p v-for="index in chunks" :key="index" class="mb-2">Reply part {{ index }}: a validated change in the release notes.</p></MessageScrollerItem>
					</MessageScrollerContent>
				</MessageScrollerViewport>
				<MessageScrollerButton label="Jump to latest" />
			</MessageScrollerRoot>
		</MessageScrollerProvider>
	</div>
</template>
