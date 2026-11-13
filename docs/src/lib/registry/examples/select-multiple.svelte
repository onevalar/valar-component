<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const id = $props.id();
	const items = [
		{ value: "issues", label: "Issue status updates" },
		{ value: "projects", label: "Project milestones and upcoming review notifications" },
		{ value: "mentions", label: "Mentions" },
	];
	let channels = $state<string[]>([]);
	let submitted = $state<string | undefined>();
</script>

<form
	class="grid w-full max-w-xs gap-3"
	onsubmit={(event) => {
		event.preventDefault();
		const selected = new FormData(event.currentTarget).getAll("channel");
		submitted = selected.length ? `Saved ${selected.join(", ")}.` : "Saved without notifications.";
	}}
	onreset={() => {
		channels = [];
		submitted = undefined;
	}}
>
	<Field.Field>
		<Field.Label for={id}>Notifications</Field.Label>
		<Select.Root type="multiple" name="channel" {items} bind:value={channels}>
			<Select.Trigger {id} size="sm" class="w-full">
				<Select.Value placeholder="Choose notification types" />
			</Select.Trigger>
			<Select.Content aria-label="Notification types">
				{#each items as item (item.value)}
					<Select.Item {...item} />
				{/each}
			</Select.Content>
		</Select.Root>
	</Field.Field>
	<div class="flex flex-wrap gap-2">
		<Button type="submit" size="sm">Save notifications</Button>
		<Button type="reset" size="sm" variant="outline">Reset notifications</Button>
	</div>
	{#if submitted}<p role="status" class="text-xs text-muted-foreground">{submitted}</p>{/if}
</form>
