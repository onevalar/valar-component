<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const id = $props.id();
</script>

<Field.Field data-disabled>
	<Field.Label for={id}>Message</Field.Label>
	<Textarea {id} disabled value="Editing is disabled for this field." />
</Field.Field>
