<script lang="ts">
	import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";

	let showBookmarksBar = $state(true);
	let showFullURLs = $state(false);
	let showDeveloperTools = $state(false);
	let toolsIndeterminate = $state(true);
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger
		role="group"
		aria-label="Checkbox actions"
		tabindex={0}
		class="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
	>
		<span class="hidden pointer-fine:inline-block">Right click here</span>
		<span class="hidden pointer-coarse:inline-block">Long press here</span>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Group>
			<ContextMenu.CheckboxItem bind:checked={showBookmarksBar}>
				Show Bookmarks Bar
			</ContextMenu.CheckboxItem>
			<ContextMenu.CheckboxItem bind:checked={showFullURLs}>Show Full URLs</ContextMenu.CheckboxItem
			>
			<ContextMenu.CheckboxItem
				bind:checked={showDeveloperTools}
				bind:indeterminate={toolsIndeterminate}
			>
				Show Developer Tools
			</ContextMenu.CheckboxItem>
		</ContextMenu.Group>
	</ContextMenu.Content>
</ContextMenu.Root>
