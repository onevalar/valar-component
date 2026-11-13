<script lang="ts">
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import { buttonVariants } from "$lib/registry/ui/button/index.js";

	let open = $state(false);
	let confirmed = $state(false);
</script>

<div class="grid justify-items-center gap-3">
	<AlertDialog.Root bind:open>
		<AlertDialog.Trigger class={buttonVariants({ variant: "outline" })}
			>Publish update</AlertDialog.Trigger
		>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Publish this update?</AlertDialog.Title>
				<AlertDialog.Description
					>The update will be visible to the project team.</AlertDialog.Description
				>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={() => {
						confirmed = true;
						open = false;
					}}>Publish</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
	<p role="status" class="min-h-5 text-xs text-muted-foreground">
		{confirmed ? "Example update published." : ""}
	</p>
</div>
