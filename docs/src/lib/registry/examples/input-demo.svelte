<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
</script>

<Field.Field class="max-w-xs">
	<Field.Label for={id}>Full name</Field.Label>
	<Input {id} autocomplete="name" placeholder="Jordan Lee" aria-describedby={`${id}-description`} />
	<Field.Description id={`${id}-description`}
		>Shown to other members of your workspace.</Field.Description
	>
</Field.Field>
