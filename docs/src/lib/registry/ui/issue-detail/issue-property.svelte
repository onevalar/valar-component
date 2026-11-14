<script lang="ts">
	import { Combobox } from "$lib/registry/ui/combobox/index.js";
	import type { IssueDetailOption } from "./model.js";
	import type { Snippet } from "svelte";

	let {
		label,
		placeholder,
		empty,
		options,
		selected,
		portal,
		multiple = false,
		onSelect,
		children: triggerContent,
		glyph,
	}: {
		label: string;
		placeholder: string;
		empty: string;
		options: readonly IssueDetailOption[];
		selected: readonly string[];
		portal: { to: string };
		multiple?: boolean;
		onSelect: (id: string) => void;
		children: Snippet;
		glyph?: Snippet<[string]>;
	} = $props();
</script>

<Combobox
	{label}
	{placeholder}
	{empty}
	{options}
	{multiple}
	{onSelect}
	value={selected}
	portalProps={portal}
	class="inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-(--detail-control) px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent @min-[860px]:h-8 @min-[860px]:w-full @min-[860px]:justify-start @min-[860px]:rounded-md @min-[860px]:border-transparent @min-[860px]:bg-transparent @min-[860px]:px-1.5 @min-[860px]:text-[13px] @min-[860px]:hover:bg-accent @min-[860px]:aria-expanded:bg-accent"
>
	{#snippet children()}
		{@render triggerContent()}
	{/snippet}
	{#snippet option(item)}
		{@render glyph?.(item.id)}
		<span class="min-w-0 flex-1 wrap-anywhere">{item.label}</span>
	{/snippet}
</Combobox>
