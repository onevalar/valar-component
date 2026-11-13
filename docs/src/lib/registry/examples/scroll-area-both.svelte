<script lang="ts">
	import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";

	const weeks = Array.from({ length: 10 }, (_, i) => i + 1);
	const tracks = ["Planning", "Design", "Prototype", "Review", "Build", "QA", "Rollout"];
</script>

<ScrollArea
	appearance="settings"
	orientation="both"
	viewportLabel="Timeline tracks"
	overscroll="contain"
	class="h-44 w-96 max-w-full rounded-lg border bg-card"
>
	<div class="grid w-max grid-cols-[repeat(10,5rem)] gap-2 p-3">
		{#each weeks as week (week)}
			<span class="px-2 text-xs text-muted-foreground">Week {week}</span>
		{/each}
		{#each tracks as track, i (track)}
			<span
				class="col-span-3 rounded-md bg-muted px-2 py-1.5 text-[13px]"
				style:grid-column-start={i + 1}>{track}</span
			>
		{/each}
	</div>
</ScrollArea>
