<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	const id = $props.id();
</script>

<Field.Group class="w-full max-w-xs">
	<Field.Field orientation="horizontal">
		<Field.Label for={`${id}-sm`}>Create more</Field.Label>
		<Switch id={`${id}-sm`} size="sm" />
	</Field.Field>
	<Field.Field orientation="horizontal">
		<Field.Label for={`${id}-default`}>Use pointer cursors</Field.Label>
		<Switch id={`${id}-default`} size="default" />
	</Field.Field>
</Field.Group>
