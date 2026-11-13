<script lang="ts">
	import { onDestroy } from "svelte";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";

	let open = $state(false);
	let pending = $state(false);
	let failed = $state(false);
	let removed = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	function remove() {
		pending = true;
		timer = setTimeout(() => {
			pending = false;
			if (!failed) {
				failed = true;
				return;
			}
			open = false;
			removed = true;
		}, 600);
	}

	onDestroy(() => clearTimeout(timer));
</script>

<div class="grid justify-items-center gap-2">
	<AlertDialog.Root
		bind:open
		onOpenChange={(nextOpen) => {
			if (nextOpen) {
				failed = false;
				removed = false;
			}
		}}
	>
		<AlertDialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Delete example issue</Button>
			{/snippet}
		</AlertDialog.Trigger>
		<AlertDialog.Content
			appearance="danger"
			focusCancel
			aria-busy={pending}
			onEscapeKeydown={(event) => {
				if (pending) event.preventDefault();
			}}
		>
			<AlertDialog.Header>
				<AlertDialog.Title>Delete this issue?</AlertDialog.Title>
				<AlertDialog.Description>
					Deleted issues are available in Recently deleted for 30 days.
				</AlertDialog.Description>
				{#if failed && !pending}<p role="alert" class="text-sm text-destructive">
						Could not delete the example issue. Try again.
					</p>{/if}
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel disabled={pending}>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action variant="destructive" loading={pending} onclick={remove}>
					{#if pending}<Spinner aria-hidden="true" />{/if}
					{pending ? "Deleting…" : failed ? "Retry deletion" : "Delete"}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
	<p role="status" class="text-sm text-muted-foreground">
		{removed ? "Example issue deleted." : ""}
	</p>
</div>
