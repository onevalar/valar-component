<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
</script>

<Field.Field class="max-w-xs">
	<Field.Label for={id}>
		Required field <span class="text-destructive" aria-hidden="true">*</span>
	</Field.Label>
	<Input {id} aria-describedby={`${id}-description`} required />
	<Field.Description id={`${id}-description`}
		>A value is required before submission.</Field.Description
	>
</Field.Field>
