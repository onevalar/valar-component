<script lang="ts">
	import SaveIcon from "@lucide/svelte/icons/save";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";

	let saved = $state(0);
</script>

<div class="flex items-center gap-3">
	<Tooltip.Hint label="Save changes" keys={["⇧", "S"]} side="top">
		{#snippet trigger({ props })}
			<Button
				{...props}
				variant="outline"
				size="icon-sm"
				aria-label="Save changes"
				aria-keyshortcuts="Shift+S"
				onclick={() => (saved += 1)}
				onkeydown={(event) => {
					if (event.shiftKey && event.code === "KeyS" && !event.repeat) {
						event.preventDefault();
						saved += 1;
					}
				}}
			>
				<SaveIcon aria-hidden="true" />
			</Button>
		{/snippet}
	</Tooltip.Hint>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		{saved ? `Saved ${saved}` : "No changes saved"}
	</p>
</div>
