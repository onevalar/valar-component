<script setup lang="ts">
import { ref } from "vue";
import {
	Attachment, AttachmentAction, AttachmentActions, AttachmentContent,
	AttachmentDescription, AttachmentMedia, AttachmentTitle, AttachmentTrigger,
} from "@valar/vue-ui/attachment";

const state = ref("uploading");
</script>

<template>
	<div class="grid min-w-0 gap-2">
		<Attachment :state="state === 'uploading' ? 'uploading' : state === 'cancelled' ? 'error' : 'done'" class="w-full">
			<AttachmentMedia><span aria-hidden="true">↗</span></AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>project-notes.txt</AttachmentTitle>
				<AttachmentDescription>{{ state === 'uploading' ? 'Uploading…' : state === 'cancelled' ? 'Upload cancelled' : 'Local preview opened' }}</AttachmentDescription>
			</AttachmentContent>
			<AttachmentActions><AttachmentAction aria-label="Cancel upload" :disabled="state !== 'uploading'" @click="state = 'cancelled'">×</AttachmentAction></AttachmentActions>
			<AttachmentTrigger aria-label="Preview project notes" @click="state = 'preview'" />
		</Attachment>
	</div>
</template>
