<script lang="ts">
	import PanelRightIcon from "@lucide/svelte/icons/panel-right";
	import * as Sheet from "$lib/registry/ui/sheet/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const id = $props.id();
	const panelId = id + "-timeline-panel";
	let open = $state(false);
	let showCompleted = $state(false);
	let trigger = $state<HTMLElement | null>(null);

	const projects = [
		{ name: "Design system refresh", health: "On track", lead: "Jordan Lee" },
		{ name: "Workspace onboarding", health: "At risk", lead: "Alex Chen" },
		{ name: "Issue triage", health: "On track", lead: "Sam Kim" },
		{ name: "Accessibility review", health: "On track", lead: "Jordan Lee" },
		{ name: "Search improvements", health: "At risk", lead: "Alex Chen" },
		{ name: "Notification settings", health: "On track", lead: "Sam Kim" },
	];
</script>

<div class="@container w-full max-w-[800px] min-w-0" data-example="sheet-timeline">
	<div class="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
		<h3 class="text-[13px] font-medium">Projects timeline</h3>
		<div class="flex items-center gap-1">
			<Button
				variant="ghost"
				size="xs"
				aria-pressed={showCompleted}
				onclick={() => (showCompleted = !showCompleted)}
			>
				Completed
			</Button>
			<Button
				bind:ref={trigger}
				variant="ghost"
				size="icon-xs"
				aria-label="Timeline sidebar"
				aria-controls={panelId}
				aria-expanded={open}
				onclick={() => (open = !open)}
			>
				<PanelRightIcon />
			</Button>
		</div>
	</div>
	<div class="flex min-w-0 flex-col @[600px]:h-60 @[600px]:flex-row">
		<div class="min-w-0 flex-1 divide-y px-3 py-2">
			{#each projects.slice(0, 3) as project (project.name)}
				<div class="py-2 text-[13px]">
					<span class="block truncate">{project.name}</span>
					<div class="mt-1 h-1.5 rounded-full bg-accent"></div>
				</div>
			{/each}
			{#if showCompleted}
				<p class="py-2 text-[13px] text-muted-foreground">Project planning · Completed</p>
			{/if}
		</div>
		<Sheet.Panel
			id={panelId}
			bind:open
			{trigger}
			label="Timeline insights"
			class="h-55 border-t @[600px]:h-auto @[600px]:w-[400px] @[600px]:border-t-0"
		>
			<Sheet.Header>
				<Tabs.Root value="health">
					<Tabs.List class="h-8 w-full" aria-label="Timeline insights">
						<Tabs.Trigger value="health">Health</Tabs.Trigger>
						<Tabs.Trigger value="leads">Leads</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="health">
						<dl class="mt-2 divide-y">
							{#each projects as project (project.name)}
								<div
									class="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-2 text-[13px]"
								>
									<dt>{project.name}</dt>
									<dd class="text-muted-foreground">{project.health}</dd>
								</div>
							{/each}
						</dl>
					</Tabs.Content>
					<Tabs.Content value="leads">
						<dl class="mt-2 divide-y">
							{#each projects as project (project.name)}
								<div
									class="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-2 text-[13px]"
								>
									<dt>{project.name}</dt>
									<dd class="text-muted-foreground">{project.lead}</dd>
								</div>
							{/each}
						</dl>
					</Tabs.Content>
				</Tabs.Root>
			</Sheet.Header>
		</Sheet.Panel>
	</div>
</div>
