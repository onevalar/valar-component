<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";

	let expanded = $state(false);

	function toggleOptions() {
		expanded = !expanded;
	}
</script>

<Tooltip.Hint label="Show display options" keys={["⇧", "V"]}>
	{#snippet trigger({ props })}
		<Button
			variant="outline"
			{...props}
			aria-pressed={expanded}
			aria-keyshortcuts="Shift+V"
			onclick={toggleOptions}
			onkeydown={(event) => {
				if (event.shiftKey && event.code === "KeyV" && !event.repeat) {
					event.preventDefault();
					toggleOptions();
				}
			}}
		>
			Display options
		</Button>
	{/snippet}
</Tooltip.Hint>
