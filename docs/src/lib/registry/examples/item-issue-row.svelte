<script lang="ts">
	import CircleDashedIcon from "@lucide/svelte/icons/circle-dashed";
	import CircleDotIcon from "@lucide/svelte/icons/circle-dot";
	import { tick } from "svelte";
	import * as Item from "$lib/registry/ui/item/index.js";

	const issues = [
		{
			id: "DS-42",
			title: "Review menu keyboard navigation and check focus after closing the workspace submenu",
			priority: "Medium priority",
			priorityLevel: 2,
			status: "In progress",
			statusIcon: CircleDotIcon,
			date: "Nov 11",
			dateTime: "2026-11-11",
		},
		{
			id: "DS-31",
			title: "Update empty state copy",
			priority: "Low priority",
			priorityLevel: 1,
			status: "Backlog",
			statusIcon: CircleDashedIcon,
			date: "Nov 8",
			dateTime: "2026-11-08",
		},
	];
	const id = $props.id();
	let activeIssue = $state<(typeof issues)[number] | null>(null);
	let detail = $state<HTMLElement | null>(null);

	async function openIssue(event: MouseEvent, issue: (typeof issues)[number]) {
		event.preventDefault();
		activeIssue = issue;
		await tick();
		detail?.focus();
	}
</script>

<div class="grid w-full max-w-xl gap-3">
	<Item.Group aria-label="Created issues" class="gap-0">
		{#each issues as issue (issue.id)}
			<div role="listitem">
				<Item.Root appearance="issue-row">
					{#snippet child({ props })}
						<a
							href={`#${id}-detail`}
							{...props}
							aria-current={activeIssue?.id === issue.id ? "true" : undefined}
							onclick={(event) => openIssue(event, issue)}
						>
							<Item.Media class="text-muted-foreground">
								<span
									class="inline-flex size-4 items-end justify-center gap-px pb-0.5"
									aria-hidden="true"
								>
									<span class="h-[5px] w-[3px] rounded-[1px] bg-current"></span>
									<span
										class="h-2 w-[3px] rounded-[1px] bg-current"
										class:opacity-30={issue.priorityLevel < 2}
									></span>
									<span class="h-[11px] w-[3px] rounded-[1px] bg-current opacity-30"></span>
								</span>
								<span class="sr-only">{issue.priority}</span>
							</Item.Media>
							<Item.Content>
								<Item.Description>{issue.id}</Item.Description>
								<issue.statusIcon
									class="size-3.5 shrink-0 text-muted-foreground"
									aria-hidden="true"
								/>
								<span class="sr-only">{issue.status}</span>
								<Item.Title>{issue.title}</Item.Title>
							</Item.Content>
							<Item.Actions><time datetime={issue.dateTime}>{issue.date}</time></Item.Actions>
						</a>
					{/snippet}
				</Item.Root>
			</div>
		{/each}
		<div role="listitem">
			<Item.Root appearance="issue-row" aria-disabled="true">
				<Item.Content>
					<Item.Description>DS-16</Item.Description>
					<Item.Title>Archived issue</Item.Title>
				</Item.Content>
			</Item.Root>
		</div>
	</Item.Group>
	<section
		bind:this={detail}
		id={`${id}-detail`}
		tabindex="-1"
		aria-labelledby={`${id}-detail-title`}
		class="grid gap-1 rounded-lg border p-3 text-sm focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid"
	>
		<h3 id={`${id}-detail-title`} class="font-medium">{activeIssue?.title ?? "Issue details"}</h3>
		<p class="text-muted-foreground">
			{activeIssue
				? `${activeIssue.id} · ${activeIssue.status} · ${activeIssue.priority}`
				: "Select an issue to view its details."}
		</p>
	</section>
</div>
