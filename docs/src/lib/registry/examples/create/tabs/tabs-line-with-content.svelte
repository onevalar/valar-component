<script lang="ts">
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import Example from "../../../../../routes/[[lang]]/(app)/(layout)/(create)/components/example.svelte";
</script>

<Example title="Line With Content">
	<Tabs.Root value="account">
		<Tabs.List variant="line">
			<Tabs.Trigger value="account">Account</Tabs.Trigger>
			<Tabs.Trigger value="password">Password</Tabs.Trigger>
			<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
		</Tabs.List>
		<div
			class="border style-valar:rounded-lg style-valar:p-4"
		>
			<Tabs.Content value="account">
				Manage your account preferences and profile information.
			</Tabs.Content>
			<Tabs.Content value="password">
				Update your password to keep your account secure.
			</Tabs.Content>
			<Tabs.Content value="notifications">
				Configure how you receive notifications and alerts.
			</Tabs.Content>
		</div>
	</Tabs.Root>
</Example>
