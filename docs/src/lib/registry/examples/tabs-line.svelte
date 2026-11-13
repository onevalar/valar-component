<script lang="ts">
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
</script>

<Tabs.Root value="overview" class="w-full max-w-[400px]">
	<Tabs.List variant="line" aria-label="Project information">
		<Tabs.Trigger value="overview">Project overview</Tabs.Trigger>
		<Tabs.Trigger value="analytics">Recent activity</Tabs.Trigger>
		<Tabs.Trigger value="reports">Status reports</Tabs.Trigger>
		<Tabs.Trigger value="milestones">Upcoming milestones</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="overview">Read the project's summary and goals.</Tabs.Content>
	<Tabs.Content value="analytics">See the latest updates from the project team.</Tabs.Content>
	<Tabs.Content value="reports">Review the current project status.</Tabs.Content>
	<Tabs.Content value="milestones">Check deadlines and planned milestones.</Tabs.Content>
</Tabs.Root>
