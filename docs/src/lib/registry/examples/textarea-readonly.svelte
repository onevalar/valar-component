<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const id = $props.id();
</script>

<Field.Field>
	<Field.Label for={id}>Project description</Field.Label>
	<Textarea {id} readonly value="Team members can view this description." />
</Field.Field>
