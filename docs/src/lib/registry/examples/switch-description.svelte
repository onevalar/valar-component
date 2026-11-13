<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	const id = $props.id();
</script>

<Field.Field orientation="horizontal" appearance="settings" class="max-w-sm rounded-lg border">
	<Field.Content>
		<Field.Label for={id}>Share across devices</Field.Label>
		<Field.Description id={`${id}-description`}>
			Focus is shared across devices, and turns off when you leave the app.
		</Field.Description>
	</Field.Content>
	<Switch {id} appearance="settings" aria-describedby={`${id}-description`} />
</Field.Field>
