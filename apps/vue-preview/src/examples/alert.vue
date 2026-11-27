<script setup lang="ts">
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@valar/vue-ui/alert";
import { Button } from "@valar/vue-ui/button";
import { nextTick, ref, useTemplateRef } from "vue";

const connected = ref(false);
const connectionStatus = useTemplateRef<HTMLParagraphElement>("connectionStatus");

async function reconnect() {
	connected.value = true;
	await nextTick();
	connectionStatus.value?.focus();
}
</script>

<template>
	<section aria-label="Alert examples" class="grid w-full max-w-lg gap-4 p-6 text-sm">
		<Alert role="status">
			<AlertTitle>Workspace invite sent</AlertTitle>
			<AlertDescription>The new member can join using the link in their email.</AlertDescription>
		</Alert>
		<Alert variant="destructive">
			<AlertTitle>Import could not finish</AlertTitle>
			<AlertDescription
				>Remove duplicate issue IDs and try importing the file again.</AlertDescription
			>
		</Alert>
		<div class="flex flex-wrap items-center gap-2">
			<Alert v-if="!connected" appearance="connection" variant="destructive">
				<AlertTitle>Offline</AlertTitle>
				<AlertAction>
					<Button size="xs" variant="ghost" @click="reconnect">Reconnect</Button>
				</AlertAction>
			</Alert>
			<p
				v-else
				ref="connectionStatus"
				tabindex="-1"
				class="text-muted-foreground focus:outline-1 focus:-outline-offset-1 focus:outline-ring"
			>
				Connection restored.
			</p>
		</div>
	</section>
</template>
