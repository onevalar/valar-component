<script lang="ts">
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let showStatusBar = $state<boolean>(true);
	let showActivityBar = $state(false);
	let showPanel = $state<boolean>(false);
	let showAll = $derived(showStatusBar && showPanel);
	let showSome = $derived(showStatusBar !== showPanel);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">Display settings</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-48">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Appearance</DropdownMenu.Label>
			<DropdownMenu.CheckboxItem
				checked={showAll}
				indeterminate={showSome}
				onCheckedChange={(checked) => {
					showStatusBar = checked;
					showPanel = checked;
				}}
			>
				Show all panels
			</DropdownMenu.CheckboxItem>
			<DropdownMenu.Separator />
			<DropdownMenu.CheckboxItem bind:checked={showStatusBar}>Status Bar</DropdownMenu.CheckboxItem>
			<DropdownMenu.CheckboxItem bind:checked={showActivityBar} disabled>
				Activity Bar
			</DropdownMenu.CheckboxItem>
			<DropdownMenu.CheckboxItem bind:checked={showPanel}>Panel</DropdownMenu.CheckboxItem>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
