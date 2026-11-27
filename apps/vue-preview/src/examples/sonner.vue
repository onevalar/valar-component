<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Toaster, toast } from "@valar/vue-ui/sonner";
import { ref } from "vue";

const archived = ref(false);

function archive() {
	archived.value = true;
	toast.success("Issue archived", {
		id: "issue-archive",
		description: "VLR-42 · Workspace filters",
		duration: 8000,
		action: { label: "Undo", onClick: () => (archived.value = false) },
	});
}
</script>

<template>
	<section aria-label="Sonner examples" class="grid justify-items-start gap-3 p-6 text-sm">
		<p>Workspace filters · {{ archived ? "Archived" : "Open" }}</p>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" @click="archive">Archive issue</Button>
			<Button variant="outline" @click="toast.info('Notifications are up to date', { id: 'sync' })"
				>Show status</Button
			>
		</div>
		<Toaster appearance="workspace" container-aria-label="Workspace notifications" />
	</section>
</template>
