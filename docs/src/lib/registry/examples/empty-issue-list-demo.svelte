<script lang="ts">
	import ListTodoIcon from "@lucide/svelte/icons/list-todo";
	import { tick } from "svelte";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { IssueComposer } from "$lib/registry/ui/issue-composer/index.js";

	let composerOpen = $state(false);
	let createButton = $state<HTMLElement | null>(null);
	let createdTitle = $state("");
	let filtered = $state(false);
	let filterButton = $state<HTMLElement | null>(null);
	let clearButton = $state<HTMLElement | null>(null);

	async function changeFilter(value: boolean) {
		filtered = value;
		await tick();
		(value ? clearButton : filterButton)?.focus();
	}
</script>

<div class="w-full min-w-0 px-4 py-12 sm:px-15 sm:py-30">
	<div class="mb-6 flex justify-center">
		<Button
			bind:ref={filterButton}
			variant="outline"
			size="sm"
			aria-pressed={filtered}
			onclick={() => changeFilter(!filtered)}
		>
			Urgent priority filter
		</Button>
	</div>
	<Empty.Root appearance={filtered ? "filtered-list" : "issue-list"}>
		<Empty.Media class="m-0 h-30 w-[161px] max-w-full text-muted-foreground/60" aria-hidden="true">
			<div class="grid size-16 place-items-center rounded-xl border border-dashed border-current">
				<ListTodoIcon class="size-8" />
			</div>
		</Empty.Media>
		<Empty.Header>
			<Empty.Title
				>{filtered ? "No issues matching the filters" : "No issues assigned to you"}</Empty.Title
			>
		</Empty.Header>
		<Empty.Content>
			{#if filtered}
				<Button
					bind:ref={clearButton}
					size="sm"
					variant="ghost"
					shape="pill"
					onclick={() => changeFilter(false)}
				>
					Clear Filters
				</Button>
			{:else}
				<Button
					bind:ref={createButton}
					size="sm"
					shape="pill"
					class="h-7 bg-(--valar-empty-issue-accent) px-2.5 text-xs text-(--valar-empty-issue-accent-foreground) shadow-[0_3px_6px_-2px_rgb(0_0_0_/_2%),0_1px_1px_rgb(0_0_0_/_4%)] hover:bg-(--valar-empty-issue-accent)/90 dark:shadow-[0_0.5px_1px_1px_rgb(0_0_0_/_30%)]"
					onclick={() => (composerOpen = true)}>Create new issue</Button
				>
			{/if}
		</Empty.Content>
	</Empty.Root>
	<p role="status" class="text-center text-[13px] text-muted-foreground">
		{createdTitle ? `Example issue created: ${createdTitle}` : ""}
	</p>
	<IssueComposer
		bind:open={composerOpen}
		returnFocus={() => createButton}
		onCreate={(issue) => (createdTitle = issue.title)}
	/>
</div>
