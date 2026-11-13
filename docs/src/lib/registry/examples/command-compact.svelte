<script lang="ts">
	import CircleDotIcon from "@lucide/svelte/icons/circle-dot";
	import FlagIcon from "@lucide/svelte/icons/flag";
	import TagsIcon from "@lucide/svelte/icons/tags";
	import { onDestroy } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let open = $state(false);
	let loading = $state(false);
	let selected = $state("");
	let timer: ReturnType<typeof setTimeout> | undefined;

	function handleOpenChange(next: boolean) {
		clearTimeout(timer);
		loading = next;
		if (!next) return;
		timer = setTimeout(() => {
			loading = false;
			timer = undefined;
		}, 700);
	}

	function select(value: string) {
		selected = value;
		open = false;
		handleOpenChange(false);
	}

	onDestroy(() => clearTimeout(timer));
</script>

<div class="flex flex-col items-center gap-3">
	<Popover.Root bind:open onOpenChange={handleOpenChange}>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Filter work</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content role="dialog" aria-label="Work filters" appearance="surface" class="w-52 p-0">
			<Command.Root appearance="compact" label="Work filters">
				<Command.Input placeholder="Add filter…" />
				<Command.List aria-label="Filter fields" aria-busy={loading}>
					{#if !loading}<Command.Empty>No matching filters.</Command.Empty>{/if}
					<Command.Group heading="Issue fields">
						<Command.Item value="Status" onSelect={() => select("Status")}>
							<CircleDotIcon />
							<span>Status</span>
						</Command.Item>
						<Command.Item value="Priority" onSelect={() => select("Priority")}>
							<FlagIcon />
							<span>Priority</span>
						</Command.Item>
						{#if !loading}
							<Command.Item value="Labels" onSelect={() => select("Labels")}>
								<TagsIcon />
								<span>Labels</span>
							</Command.Item>
						{/if}
						<Command.Item value="Team" disabled>
							<span>Team</span>
						</Command.Item>
					</Command.Group>
				</Command.List>
				{#if loading}
					<Command.Loading>Loading more filters…</Command.Loading>
				{/if}
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
	<p role="status" class="text-sm text-muted-foreground">
		{selected ? `Selected ${selected}` : "Choose a filter field"}
	</p>
</div>
