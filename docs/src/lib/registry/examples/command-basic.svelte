<script lang="ts">
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import InboxIcon from "@lucide/svelte/icons/inbox";
	import LayoutListIcon from "@lucide/svelte/icons/layout-list";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import * as Command from "$lib/registry/ui/command/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let open = $state(false);
	let lastAction = $state("");

	function openWithShortcut(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "k") {
			event.preventDefault();
			event.stopPropagation();
			open = true;
		}
	}

	function runCommand(label: string) {
		lastAction = label;
		open = false;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<Command.Dialog
		bind:open
		title="Workspace commands"
		description="Find and run a workspace command"
		label="Workspace commands"
	>
		{#snippet trigger({ props })}
			<Button {...props} variant="outline" onkeydown={openWithShortcut}>Open command menu</Button>
		{/snippet}
		<Command.Input placeholder="Search commands…" />
		<Command.List>
			<Command.Empty>No matching commands. Try another term.</Command.Empty>
			<Command.Group heading="Go to">
				<Command.Item
					value="inbox"
					keywords={["notifications"]}
					onSelect={() => runCommand("Inbox")}
				>
					<InboxIcon />
					<span>Inbox</span>
				</Command.Item>
				<Command.Item value="projects" keywords={["work"]} onSelect={() => runCommand("Projects")}>
					<LayoutListIcon />
					<span>Projects</span>
				</Command.Item>
			</Command.Group>
			<Command.Group heading="Actions">
				<Command.Item
					value="create issue"
					keywords={["task"]}
					onSelect={() => runCommand("Create issue")}
				>
					<CalendarIcon />
					<span>Create issue</span>
				</Command.Item>
				<Command.Item
					value="preferences"
					keywords={["settings"]}
					onSelect={() => runCommand("Preferences")}
				>
					<SettingsIcon />
					<span>Preferences</span>
				</Command.Item>
			</Command.Group>
		</Command.List>
	</Command.Dialog>
	<p role="status" class="text-sm text-muted-foreground">
		{lastAction ? `Ran ${lastAction}` : "No command run yet"}
	</p>
</div>
