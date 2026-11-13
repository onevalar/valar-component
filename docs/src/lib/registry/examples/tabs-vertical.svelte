<script lang="ts">
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
</script>

<Tabs.Root value="account" orientation="vertical" class="w-full max-w-[400px]">
	<Tabs.List aria-label="Preferences">
		<Tabs.Trigger value="account">Account</Tabs.Trigger>
		<Tabs.Trigger value="password">Password</Tabs.Trigger>
		<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="account" class="py-2">Manage your account details.</Tabs.Content>
	<Tabs.Content value="password" class="py-2">Update your password.</Tabs.Content>
	<Tabs.Content value="notifications" class="py-2"
		>Choose which notifications you receive.</Tabs.Content
	>
</Tabs.Root>
