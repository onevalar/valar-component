<script lang="ts">
	import { tick } from "svelte";
	import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let viewingIssue = $state(true);
	let issuesLink = $state<HTMLAnchorElement | null>(null);
	let issueButton = $state<HTMLButtonElement | null>(null);
	const issueListId = $props.id();
	const issueTitle = "VLR-12 Refine workspace navigation and preserve keyboard focus";
	const views = ["Workspace navigation", "My issues", issueTitle] as const;
	let section = $state<(typeof views)[number]>(issueTitle);

	async function showIssues(event: MouseEvent, destination: (typeof views)[0 | 1]) {
		event.preventDefault();
		viewingIssue = false;
		section = destination;
		await tick();
		issueButton?.focus();
	}

	async function showIssue() {
		viewingIssue = true;
		section = issueTitle;
		await tick();
		issuesLink?.focus();
	}
</script>

<div class="w-full max-w-md">
	<Breadcrumb.Root appearance="workspace" aria-label="Issue location">
		<Breadcrumb.List>
			{#if viewingIssue}
				<Breadcrumb.Item>
					<Breadcrumb.Link
						href={`#${issueListId}`}
						onclick={(event) => showIssues(event, views[0])}
					>
						{views[0]}
					</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Link
						bind:ref={issuesLink}
						href={`#${issueListId}`}
						onclick={(event) => showIssues(event, views[1])}
					>
						My issues
					</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Page>{issueTitle}</Breadcrumb.Page>
				</Breadcrumb.Item>
			{:else}
				<Breadcrumb.Item><Breadcrumb.Page>{section}</Breadcrumb.Page></Breadcrumb.Item>
			{/if}
		</Breadcrumb.List>
	</Breadcrumb.Root>
	<div id={issueListId} class="border-t pt-3" hidden={viewingIssue}>
		<Button
			bind:ref={issueButton}
			variant="ghost"
			size="sm"
			class="h-auto min-h-8 max-w-full wrap-anywhere whitespace-normal"
			onclick={showIssue}
		>
			{issueTitle}
		</Button>
	</div>
</div>
