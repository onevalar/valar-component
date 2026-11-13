<script lang="ts">
	import { Kbd, KbdGroup } from "$lib/registry/ui/kbd/index.js";
	import TooltipContent from "./tooltip-content.svelte";
	import TooltipTrigger from "./tooltip-trigger.svelte";
	import TooltipRoot from "./tooltip.svelte";
	import type { Tooltip as TooltipPrimitive } from "bits-ui";

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
		portal?: { to: string };
		disabled?: boolean;
		trigger: NonNullable<TooltipPrimitive.TriggerProps["child"]>;
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
