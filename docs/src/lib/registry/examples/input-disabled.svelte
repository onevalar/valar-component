<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
</script>

<Field.Field data-disabled class="max-w-xs">
	<Field.Label for={id}>Managed email</Field.Label>
	<Input
		{id}
		type="email"
		value="jordan@example.com"
		aria-describedby={`${id}-description`}
		disabled
	/>
	<Field.Description id={`${id}-description`}
		>Your workspace manages this email address.</Field.Description
	>
</Field.Field>
