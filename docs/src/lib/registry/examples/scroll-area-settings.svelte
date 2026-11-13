<script lang="ts">
	import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";

	const sections = [
		{
			title: "Account",
			items: ["Preferences", "Profile", "Notifications", "Connected accounts"],
		},
		{
			title: "Workspace",
			items: ["General", "Members", "Teams", "Labels", "Templates", "Integrations"],
		},
		{
			title: "Teams",
			items: ["Overview", "Workflow", "Cycles", "Estimates", "Triage", "Issue statuses"],
		},
	];
</script>

<ScrollArea
	appearance="settings"
	viewportLabel="Settings navigation"
	overscroll="contain"
	class="h-64 w-48 max-w-full rounded-lg bg-muted/35"
>
	<div class="grid gap-3 px-3 pt-[26px] pb-1">
		{#each sections as section (section.title)}
			<div>
				<p class="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">{section.title}</p>
				<ul>
					{#each section.items as item (item)}
						<li
							class="flex h-7 items-center rounded-lg px-2 text-[13px]"
							class:bg-accent={item === "Preferences"}
							class:text-accent-foreground={item === "Preferences"}
						>
							{item}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</ScrollArea>
