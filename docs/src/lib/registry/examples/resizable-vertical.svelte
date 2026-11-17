<script lang="ts">
	import * as Resizable from "$lib/registry/ui/resizable/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	let locked = $state(false);
</script>

<div class="grid w-full max-w-sm gap-3">
	<Button
		size="sm"
		variant="outline"
		class="justify-self-start"
		aria-pressed={locked}
		onclick={() => (locked = !locked)}
	>
		Lock divider
	</Button>
	<Resizable.PaneGroup direction="vertical" class="min-h-52 overflow-hidden rounded-lg border">
		<Resizable.Pane defaultSize={40} minSize={25} maxSize={65}>
			<section class="grid h-full place-items-center border-b px-3" aria-label="Header pane">
				Header
			</section>
		</Resizable.Pane>
		<Resizable.Handle
			appearance="workspace"
			aria-label="Resize header and content"
			disabled={locked}
		/>
		<Resizable.Pane defaultSize={60} minSize={35}>
			<section class="grid h-full place-items-center px-3" aria-label="Content pane">
				Content
			</section>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
