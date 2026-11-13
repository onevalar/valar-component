<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import type { IssuePriority, IssueStatus } from "./issue-options.js";

	let { value }: { value: IssuePriority | IssueStatus } = $props();

	const statusStyles = {
		backlog: "border-dashed border-current",
		todo: "border-current",
		progress:
			"border-amber-500 bg-[linear-gradient(90deg,var(--color-amber-500)_50%,transparent_50%)]",
		done: "border-indigo-500 bg-indigo-500 text-white",
		canceled: "border-current",
	};
	const levels = { high: 3, medium: 2, low: 1 };
</script>

{#if value in statusStyles}
	<span
		class="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border {statusStyles[
			value as IssueStatus
		]}"
		aria-hidden="true"
	>
		{#if value === "done"}<IconPlaceholder
				lucide="CheckIcon"
				tabler="IconCheck"
				hugeicons="Tick02Icon"
				phosphor="CheckIcon"
				remixicon="RiCheckLine"
				aria-hidden="true"
				class="size-2.5"
			/>{/if}
		{#if value === "canceled"}<IconPlaceholder
				lucide="XIcon"
				tabler="IconX"
				hugeicons="Cancel01Icon"
				phosphor="XIcon"
				remixicon="RiCloseLine"
				aria-hidden="true"
				class="size-2.5"
			/>{/if}
	</span>
{:else}
	<span class="inline-flex size-3.5 shrink-0 items-center justify-center" aria-hidden="true">
		{#if value === "urgent"}
			<span
				class="grid size-3.5 place-items-center rounded-[3px] bg-orange-600 text-[10px] leading-none font-semibold text-white"
				>!</span
			>
		{:else if value === "none"}
			<span class="text-xs leading-none tracking-tighter">···</span>
		{:else if value === "high" || value === "medium" || value === "low"}
			{#each [1, 2, 3] as bar (bar)}
				<span
					class="mx-px w-0.5 self-end rounded-full bg-current"
					style:height={`${3 + bar * 3}px`}
					style:opacity={bar <= levels[value] ? 1 : 0.25}
				></span>
			{/each}
		{/if}
	</span>
{/if}
