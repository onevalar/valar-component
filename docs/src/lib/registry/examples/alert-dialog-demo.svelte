<script lang="ts">
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let open = $state(false);
	let status = $state("");
</script>

<div class="grid justify-items-center gap-3">
	<AlertDialog.Root bind:open>
		<AlertDialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Close draft</Button>
			{/snippet}
		</AlertDialog.Trigger>
		<AlertDialog.Content appearance="confirmation" focusCancel>
			<AlertDialog.Header>
				<AlertDialog.Title>Save to drafts?</AlertDialog.Title>
				<AlertDialog.Description>
					Save this example draft to continue working on it later.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Action
					variant="ghost"
					onclick={() => {
						status = "Discarded the example draft.";
						open = false;
					}}>Discard draft</AlertDialog.Action
				>
				<AlertDialog.Cancel onclick={() => (status = "Kept editing the draft.")}>
					Keep editing
				</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={() => {
						status = "Saved the example draft.";
						open = false;
					}}>Save draft</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
	<p role="status" class="min-h-5 text-xs text-muted-foreground">{status}</p>
</div>
