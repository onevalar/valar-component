<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	const id = $props.id();
</script>

<Field.Group class="w-full max-w-sm gap-0">
	<Field.Field orientation="horizontal" appearance="settings" data-disabled="true">
		<Field.Content>
			<Field.Label for={`${id}-off`}>Workspace alerts</Field.Label>
			<Field.Description id={`${id}-off-description`}
				>Managed by an administrator.</Field.Description
			>
		</Field.Content>
		<Switch id={`${id}-off`} aria-describedby={`${id}-off-description`} disabled />
	</Field.Field>
	<Field.Field orientation="horizontal" appearance="settings" data-disabled="true">
		<Field.Content>
			<Field.Label for={`${id}-on`}>Security notices</Field.Label>
			<Field.Description id={`${id}-on-description`}>Required for this workspace.</Field.Description
			>
		</Field.Content>
		<Switch id={`${id}-on`} aria-describedby={`${id}-on-description`} checked disabled />
	</Field.Field>
</Field.Group>
