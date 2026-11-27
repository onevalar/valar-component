<script setup lang="ts">
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@valar/vue-ui/alert-dialog";
import { Button } from "@valar/vue-ui/button";
import { ref } from "vue";

const open = ref(false);
const deleted = ref(false);

function deleteDraft() {
	deleted.value = true;
	open.value = false;
}
</script>

<template>
	<section aria-label="Alert Dialog examples" class="grid w-full max-w-sm gap-3 p-6 text-sm">
		<p role="status">
			{{ deleted ? "Launch checklist draft deleted." : "Launch checklist · Unpublished draft" }}
		</p>
		<AlertDialog :open="open" @update:open="open = $event && !deleted">
			<AlertDialogTrigger as-child>
				<Button class="justify-self-start" variant="outline" :aria-disabled="deleted || undefined">
					Delete draft
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent appearance="danger" focus-cancel>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete the launch checklist draft?</AlertDialogTitle>
					<AlertDialogDescription>
						The draft and its unpublished changes will be permanently deleted. This cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant="destructive" @click="deleteDraft"
						>Delete draft</AlertDialogAction
					>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</section>
</template>
