<script lang="ts">
	import * as Kbd from "$lib/registry/ui/kbd/index.js";
</script>

<div class="flex flex-col items-center gap-4">
	<p class="text-sm text-muted-foreground">
		Press
		<Kbd.Group aria-label="Shift and Tab">
			<Kbd.Root>⇧</Kbd.Root>
			<Kbd.Root>Tab</Kbd.Root>
		</Kbd.Group>
		to move to the previous control.
	</p>
</div>
