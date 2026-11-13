<script lang="ts">
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	let alerts = $state(false);
	let summaries = $state(true);
</script>

<Card.Root size="settings" class="w-full max-w-[640px]">
	<Card.Content>
		<Field.Group class="gap-0">
			<Field.Field
				orientation="responsive"
				appearance="settings"
				class="min-h-16 gap-3 p-4 @md/field-group:items-center!"
			>
				<Field.Content class="min-w-0">
					<Field.Label for="card-settings-alerts">Desktop notifications</Field.Label>
					<Field.Description>Show updates when this workspace is open.</Field.Description>
				</Field.Content>
				<Switch id="card-settings-alerts" bind:checked={alerts} />
			</Field.Field>
			<Separator />
			<Field.Field
				orientation="responsive"
				appearance="settings"
				class="min-h-16 gap-3 p-4 @md/field-group:items-center!"
			>
				<Field.Content class="min-w-0">
					<Field.Label for="card-settings-summaries">Weekly activity summary</Field.Label>
					<Field.Description>Group the updates you missed into a weekly summary.</Field.Description>
				</Field.Content>
				<Switch id="card-settings-summaries" bind:checked={summaries} />
			</Field.Field>
			<Separator />
			<div class="flex min-h-16 flex-wrap items-center justify-between gap-3 p-4">
				<p class="text-sm text-muted-foreground">Restore the initial notification preferences.</p>
				<Button
					variant="outline"
					size="sm"
					disabled={!alerts && summaries}
					onclick={() => {
						alerts = false;
						summaries = true;
					}}>Reset preferences</Button
				>
			</div>
		</Field.Group>
	</Card.Content>
</Card.Root>
