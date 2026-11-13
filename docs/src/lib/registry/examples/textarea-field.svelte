<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const id = $props.id();
</script>

<Field.Field>
	<Field.Content>
		<Field.Label for={id}>Message</Field.Label>
		<Field.Description id={`${id}-hint`}>Enter your message below.</Field.Description>
	</Field.Content>
	<Textarea {id} aria-describedby={`${id}-hint`} placeholder="Type your message here." />
</Field.Field>
