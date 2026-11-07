<script lang="ts">
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import Example from "../../../../../routes/[[lang]]/(app)/(layout)/(create)/components/example.svelte";
</script>

<Example title="With Input and Button" containerClass="col-span-full">
	<Tabs.Root value="overview" class="mx-auto w-full max-w-lg">
		<div class="flex items-center gap-4">
			<Tabs.List>
				<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
				<Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
			</Tabs.List>
			<div class="ml-auto flex items-center gap-2">
				<Input placeholder="Search..." class="w-44" />
				<Button>Action</Button>
			</div>
		</div>
		<div
			class="border style-valar:rounded-lg style-valar:p-4"
		>
			<Tabs.Content value="overview">
				View your dashboard metrics and key performance indicators.
			</Tabs.Content>
			<Tabs.Content value="analytics">
				Detailed analytics and insights about your data.
			</Tabs.Content>
			<Tabs.Content value="reports">Generate and view custom reports.</Tabs.Content>
		</div>
	</Tabs.Root>
</Example>
