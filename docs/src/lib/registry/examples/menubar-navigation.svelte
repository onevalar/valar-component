<script lang="ts">
	import * as Menubar from "$lib/registry/ui/menubar/index.js";

	let selection = $state("Issue board");
</script>

<div class="grid min-w-0 gap-3">
	<Menubar.Root appearance="navigation" aria-label="Workspace navigation">
		<Menubar.Menu>
			<Menubar.Trigger>Workspace</Menubar.Trigger>
			<Menubar.Content>
				<Menubar.Group>
					<Menubar.GroupHeading>Team views</Menubar.GroupHeading>
					<Menubar.Item onSelect={() => (selection = "Issue board")}>Issue board</Menubar.Item>
					<Menubar.Item onSelect={() => (selection = "Project overview")}>
						Project overview
					</Menubar.Item>
				</Menubar.Group>
			</Menubar.Content>
		</Menubar.Menu>
		<Menubar.Menu>
			<Menubar.Trigger>Resources</Menubar.Trigger>
			<Menubar.Content>
				<Menubar.Group>
					<Menubar.GroupHeading>Help and reference</Menubar.GroupHeading>
					<Menubar.Item onSelect={() => (selection = "Component guide")}>
						Component guide
					</Menubar.Item>
					<Menubar.Sub>
						<Menubar.SubTrigger>Keyboard help</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.Item onSelect={() => (selection = "Navigation shortcuts")}>
								Navigation shortcuts
							</Menubar.Item>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Item disabled>Export workspace</Menubar.Item>
				</Menubar.Group>
			</Menubar.Content>
		</Menubar.Menu>
	</Menubar.Root>
	<p class="text-muted-foreground text-xs" role="status">Current view: {selection}</p>
</div>
