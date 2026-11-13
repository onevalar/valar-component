<script lang="ts">
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
</script>

<Tabs.Root value="home" class="w-full max-w-xs">
	<Tabs.List aria-label="Workspace access">
		<Tabs.Trigger value="home">Home</Tabs.Trigger>
		<Tabs.Trigger value="settings" disabled>Billing</Tabs.Trigger>
		<Tabs.Trigger value="members">Members</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="home">Billing settings are available to workspace owners.</Tabs.Content>
	<Tabs.Content value="settings">Manage the workspace plan.</Tabs.Content>
	<Tabs.Content value="members">See who has access to the workspace.</Tabs.Content>
</Tabs.Root>
