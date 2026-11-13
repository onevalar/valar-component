<script lang="ts">
	import CircleFadingPlusIcon from "@lucide/svelte/icons/circle-fading-plus";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import { buttonVariants } from "$lib/registry/ui/button/index.js";
	let open = $state(false);
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class={buttonVariants({ variant: "outline" })}
		>Share Project</AlertDialog.Trigger
	>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Media>
				<CircleFadingPlusIcon />
			</AlertDialog.Media>
			<AlertDialog.Title>Share this project?</AlertDialog.Title>
			<AlertDialog.Description>
				Anyone with the link will be able to view and edit this project.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={() => (open = false)}>Share</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
