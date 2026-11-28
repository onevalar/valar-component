<script lang="ts">
	import type { Snippet } from "svelte";
	import { Kbd, KbdGroup } from "$lib/registry/ui/kbd/index.js";
	import TooltipContent from "./tooltip-content.svelte";
	import TooltipTrigger from "./tooltip-trigger.svelte";
	import TooltipRoot from "./tooltip.svelte";

	let {
		label,
		keys = [],
		side = "bottom",
		portal,
		disabled = false,
		trigger,
	}: {
		label: string;
		keys?: readonly string[];
		side?: "top" | "bottom" | "left" | "right";
		portal?: { to?: string | Element | DocumentFragment | null; disabled?: boolean };
		disabled?: boolean;
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();
</script>

<TooltipRoot disableHoverableContent {disabled}>
	<TooltipTrigger child={trigger} />
	<TooltipContent appearance="surface" sideOffset={6} {side} portalProps={portal}>
		<span class="min-w-0">{label}</span>
		{#if keys.length}
			<KbdGroup class="shrink-0">
				{#each keys as key, index (index)}
					<Kbd appearance="compact">{key}</Kbd>
				{/each}
			</KbdGroup>
		{/if}
	</TooltipContent>
</TooltipRoot>
