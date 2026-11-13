<script lang="ts">
	import BoldIcon from "@lucide/svelte/icons/bold";
	import ItalicIcon from "@lucide/svelte/icons/italic";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";

	let formats = $state<string[]>([]);
</script>

<div class="grid gap-3">
	<ToggleGroup.Root
		type="multiple"
		appearance="toolbar"
		aria-label="Text formatting"
		bind:value={formats}
		class="p-1"
	>
		<ToggleGroup.Item value="bold" aria-label="Bold"><BoldIcon /></ToggleGroup.Item>
		<ToggleGroup.Item value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroup.Item>
	</ToggleGroup.Root>
	<p
		class="text-sm"
		class:font-bold={formats.includes("bold")}
		class:italic={formats.includes("italic")}
	>
		Draft a project update.
	</p>
</div>
