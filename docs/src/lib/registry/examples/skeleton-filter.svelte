<script lang="ts">
	import { onDestroy } from "svelte";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Item from "$lib/registry/ui/item/index.js";
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

	const filters = ["Status is In progress", "Priority is High", "Labels include bug"];
	const issues = [
		{ id: "DEMO-21", title: "Keep the filter toolbar visible" },
		{ id: "DEMO-24", title: "Preserve issue list positions" }
	];
	let state = $state<"idle" | "pending" | "ready">("idle");
	let pendingTimer: ReturnType<typeof setTimeout> | undefined;

	function generateFilters() {
		if (state === "pending") return;
		state = "pending";
		pendingTimer = setTimeout(() => {
			state = "ready";
			pendingTimer = undefined;
		}, 2600);
	}

	onDestroy(() => clearTimeout(pendingTimer));
</script>

<section aria-label="Issue filter placeholders" class="w-full min-w-0 max-w-2xl space-y-3">
	<div class="grid justify-items-start gap-1.5">
		<Button size="sm" variant="outline" aria-disabled={state === "pending"} onclick={generateFilters}>
			Generate filters
		</Button>
		<p role="status" class="min-h-4 text-xs text-muted-foreground">
			{#if state === "pending"}
				Generating filters…
			{:else if state === "ready"}
				3 filters applied
			{/if}
		</p>
	</div>

	<div
		role="group"
		aria-label="Issue filters"
		aria-busy={state === "pending"}
		class="grid min-h-6 grid-cols-[minmax(0,168px)_minmax(0,198px)_minmax(0,152px)] gap-2"
	>
		{#if state === "pending"}
			{#each filters as label, position (label)}
				<Skeleton appearance="filter" delay={250 * position} />
			{/each}
		{:else if state === "ready"}
			{#each filters as label (label)}
				<Badge variant="outline" truncate class="h-6 w-full shrink justify-start rounded-[8px]">
					{label}
				</Badge>
			{/each}
		{/if}
	</div>

	<ul aria-label="Issues" class="divide-y border-y">
		{#each issues as issue (issue.id)}
			<li>
				<Item.Root appearance="issue-row">
					<span class="shrink-0 text-xs text-muted-foreground">{issue.id}</span>
					<span class="min-w-0 truncate">{issue.title}</span>
				</Item.Root>
			</li>
		{/each}
	</ul>
</section>
