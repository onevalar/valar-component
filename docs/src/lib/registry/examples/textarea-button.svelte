<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const id = $props.id();
	let draft = $state("");
	let sent = $state(false);
</script>

<form
	class="grid w-full gap-2"
	onsubmit={(event) => {
		event.preventDefault();
		if (!draft.trim()) return;
		draft = "";
		sent = true;
	}}
>
	<Field.Field>
		<Field.Label for={id}>Message</Field.Label>
		<Textarea
			{id}
			bind:value={draft}
			placeholder="Type your message here."
			oninput={() => (sent = false)}
			required
		/>
	</Field.Field>
	<Button type="submit" class="justify-self-end">Send message</Button>
	{#if sent}
		<p role="status" class="text-sm text-muted-foreground">Message sent in this preview.</p>
	{/if}
</form>
