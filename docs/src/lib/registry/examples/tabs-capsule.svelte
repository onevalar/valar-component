<script lang="ts">
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
</script>

<Tabs.Root value="health" activationMode="manual" class="w-full max-w-xs">
	<Tabs.List variant="capsule" aria-label="Project breakdown">
		<Tabs.Trigger value="health">Health</Tabs.Trigger>
		<Tabs.Trigger value="leads">Leads</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="health">
		<dl class="grid gap-2 px-1 py-2">
			<div class="flex items-center justify-between gap-3">
				<dt>On track</dt>
				<dd class="text-muted-foreground tabular-nums">3 projects</dd>
			</div>
			<div class="flex items-center justify-between gap-3">
				<dt>At risk</dt>
				<dd class="text-muted-foreground tabular-nums">1 project</dd>
			</div>
		</dl>
	</Tabs.Content>
	<Tabs.Content value="leads">
		<dl class="grid gap-2 px-1 py-2">
			<div class="flex items-center justify-between gap-3">
				<dt>Project lead assigned</dt>
				<dd class="text-muted-foreground tabular-nums">2 projects</dd>
			</div>
			<div class="flex items-center justify-between gap-3">
				<dt>No lead</dt>
				<dd class="text-muted-foreground tabular-nums">2 projects</dd>
			</div>
		</dl>
	</Tabs.Content>
</Tabs.Root>
