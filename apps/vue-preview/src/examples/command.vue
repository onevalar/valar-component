<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandLinkItem,
	CommandList,
} from "@valar/vue-ui/command";
import { ref } from "vue";

const open = ref(false);
const lastAction = ref("No action yet");

function createIssue() {
	lastAction.value = "New issue selected";
	open.value = false;
}
</script>

<template>
	<section aria-label="Command examples" class="grid justify-items-start gap-4 p-6 text-sm">
		<CommandDialog
			v-model:open="open"
			title="Workspace commands"
			description="Search actions or jump to workspace settings."
			show-close-button
			close-label="Close commands"
		>
			<template #trigger><Button variant="outline">Open commands</Button></template>
			<CommandInput aria-label="Search commands" placeholder="Search actions…" />
			<CommandList>
				<CommandEmpty>No matching commands. Try another keyword.</CommandEmpty>
				<CommandGroup heading="Actions">
					<CommandItem value="new-issue" :keywords="['create', '新建问题']" @select="createIssue"
						>New issue</CommandItem
					>
					<CommandItem value="archive" disabled>Archive workspace</CommandItem>
				</CommandGroup>
				<CommandGroup heading="Navigation">
					<CommandLinkItem
						value="settings"
						href="#command-workspace-settings"
						@select="open = false"
						>Workspace settings</CommandLinkItem
					>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
		<p role="status">{{ lastAction }}</p>
		<h2 id="command-workspace-settings" class="font-semibold">Workspace settings</h2>
	</section>
</template>
