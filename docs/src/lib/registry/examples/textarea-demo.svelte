<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const id = $props.id();
</script>

<Field.Field class="max-w-md">
	<Field.Label for={id}>Message</Field.Label>
	<Textarea {id} placeholder="Type your message here." />
</Field.Field>
