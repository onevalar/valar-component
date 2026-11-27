<script setup lang="ts">
import { Bubble, BubbleContent } from "@valar/vue-ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@valar/vue-ui/message";
</script>

<template>
	<MessageGroup>
		<Message align="end">
			<MessageContent><MessageHeader>You</MessageHeader><Bubble variant="muted" align="end"><BubbleContent>Can you summarize the release?</BubbleContent></Bubble><MessageFooter><time datetime="10:42">10:42</time></MessageFooter></MessageContent>
		</Message>
		<Message>
			<MessageAvatar aria-hidden="true">✦</MessageAvatar>
			<MessageContent><MessageHeader>Assistant</MessageHeader><Bubble variant="ghost"><BubbleContent>Two fixes passed validation. The release still needs review.</BubbleContent></Bubble><MessageFooter><time datetime="10:43">10:43</time></MessageFooter></MessageContent>
		</Message>
	</MessageGroup>
</template>
