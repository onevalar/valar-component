<script lang="ts">
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
</script>

<div class="flex max-w-xs flex-col items-start gap-2">
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<span {...props} class="inline-block w-fit">
					<Button variant="outline" disabled>Disabled</Button>
				</span>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>This feature is currently unavailable. Check your workspace settings to see when it can be enabled.</p>
		</Tooltip.Content>
	</Tooltip.Root>
	<p class="text-sm text-muted-foreground">Available on the Business plan.</p>
</div>
