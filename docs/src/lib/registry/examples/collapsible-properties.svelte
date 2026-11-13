<script lang="ts">
	import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	let locked = $state(false);
</script>

<div class="grid w-full max-w-xs gap-3">
	<Collapsible.Root appearance="properties" open disabled={locked} class="w-full min-w-0">
		<Collapsible.Trigger>
			<svg
				data-slot="collapsible-indicator"
				viewBox="0 0 16 16"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M6 5.8c0-.4.4-.6.75-.4l3.75 2.2a.46.46 0 0 1 0 .8l-3.75 2.2c-.35.2-.75 0-.75-.4Z"
				/>
			</svg>
			Properties
		</Collapsible.Trigger>
		<Collapsible.Content>
			<dl class="py-1 ps-[27px] pe-2 text-[13px]">
				<div class="flex min-h-7 items-center justify-between gap-2">
					<dt class="text-muted-foreground">Status</dt>
					<dd>In progress</dd>
				</div>
				<div class="flex min-h-7 items-center justify-between gap-2">
					<dt class="text-muted-foreground">Lead</dt>
					<dd>Avery Chen</dd>
				</div>
			</dl>
		</Collapsible.Content>
	</Collapsible.Root>
	<Button
		size="sm"
		variant="outline"
		class="justify-self-start"
		aria-pressed={locked}
		onclick={() => (locked = !locked)}
	>
		Lock properties
	</Button>
</div>
