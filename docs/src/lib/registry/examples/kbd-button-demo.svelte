<script lang="ts">
	import * as Kbd from "$lib/registry/ui/kbd/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let accepted = $state(false);
</script>

<div class="flex flex-wrap items-center gap-3">
	<Button variant="outline" aria-keyshortcuts="Enter" onclick={() => (accepted = true)}>
		Accept <Kbd.Root data-icon="inline-end" aria-hidden="true">⏎</Kbd.Root>
	</Button>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		{accepted ? "Accepted" : "Awaiting confirmation"}
	</p>
</div>
