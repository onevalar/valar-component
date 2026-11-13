<script lang="ts">
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import ShareIcon from "@lucide/svelte/icons/share";
	import TrashIcon from "@lucide/svelte/icons/trash";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let trigger: HTMLButtonElement | null = $state(null);
	let cancel: HTMLButtonElement | null = $state(null);
	let confirm = $state(false);
	let deleted = $state(false);
</script>

<div class="flex flex-col items-center gap-2">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger bind:ref={trigger}>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Actions</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			class="w-52"
			onCloseAutoFocus={(event) => {
				if (confirm) event.preventDefault();
			}}
		>
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					<PencilIcon />
					Edit
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<ShareIcon />
					Share
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Item disabled={deleted} onSelect={() => (confirm = true)}>
				<TrashIcon />
				Delete…
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<span role="status" class="text-xs text-muted-foreground">{deleted ? "Issue deleted" : ""}</span>
</div>

<AlertDialog.Root bind:open={confirm}>
	<AlertDialog.Content
		appearance="danger"
		onOpenAutoFocus={(event) => {
			if (!cancel) return;
			event.preventDefault();
			cancel.focus();
		}}
		onCloseAutoFocus={(event) => {
			event.preventDefault();
			trigger?.focus();
		}}
	>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete issue?</AlertDialog.Title>
			<AlertDialog.Description>This action permanently deletes the issue.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel bind:ref={cancel}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				variant="destructive"
				onclick={() => {
					deleted = true;
					confirm = false;
				}}
			>
				Delete issue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
