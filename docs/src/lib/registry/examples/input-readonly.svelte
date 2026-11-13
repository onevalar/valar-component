<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
</script>

<Field.Field class="max-w-xs">
	<Field.Label for={id}>Issue ID</Field.Label>
	<Input {id} readonly value="VLR-42" aria-describedby={`${id}-description`} />
	<Field.Description id={`${id}-description`}
		>Select and copy the issue identifier.</Field.Description
	>
</Field.Field>
