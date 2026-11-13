<script lang="ts">
	import InboxIcon from "@lucide/svelte/icons/inbox";
	import * as Resizable from "$lib/registry/ui/resizable/index.js";
</script>

<Resizable.PaneGroup
	direction="horizontal"
	class="h-48 w-full max-w-lg overflow-hidden rounded-xl border bg-background"
>
	<Resizable.Pane defaultSize={43} minSize={30} maxSize={65}>
		<section class="flex h-full flex-col border-e" aria-label="Inbox">
			<h3 class="flex h-11 shrink-0 items-center border-b px-3 text-[13px] font-medium">Inbox</h3>
			<p class="m-auto px-2 text-center text-xs text-muted-foreground">You're all caught up</p>
		</section>
	</Resizable.Pane>
	<Resizable.Handle
		appearance="workspace"
		aria-label="Resize Inbox and details"
		aria-orientation="vertical"
	/>
	<Resizable.Pane defaultSize={57} minSize={35}>
		<section class="flex h-full items-center justify-center" aria-label="Notification details">
			<div class="flex flex-col items-center gap-2 px-2 text-center text-xs text-muted-foreground">
				<InboxIcon size={18} aria-hidden="true" />
				<p>No notification selected</p>
			</div>
		</section>
	</Resizable.Pane>
</Resizable.PaneGroup>
