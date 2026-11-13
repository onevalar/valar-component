<script lang="ts">
	import IconCornerDownLeft from "@tabler/icons-svelte/icons/corner-down-left";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";

	const id = $props.id();
	let message = $state("");
	let submitted = $state("");
</script>

<form
	class="grid w-full max-w-md gap-3"
	onsubmit={(event) => {
		event.preventDefault();
		if (!message.trim()) return;
		submitted = message.trim();
		message = "";
	}}
>
	<Field.Field>
		<Field.Label for={id}>Message draft</Field.Label>
		<InputGroup.Root>
			<InputGroup.Textarea
				{id}
				bind:value={message}
				maxlength={280}
				aria-describedby={`${id}-limit`}
				placeholder="Write a message…"
			/>
			<InputGroup.Addon align="block-end" class="justify-between">
				<InputGroup.Text id={`${id}-limit`}>{message.length} / 280 characters</InputGroup.Text>
				<InputGroup.Button size="sm" type="submit" variant="default" disabled={!message.trim()}>
					Send <IconCornerDownLeft aria-hidden="true" />
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
	</Field.Field>
	<p role="status" class="text-sm break-words">{submitted ? `Sent: ${submitted}` : ""}</p>
</form>
