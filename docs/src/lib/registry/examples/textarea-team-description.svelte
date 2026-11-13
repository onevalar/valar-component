<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const id = $props.id();
	const limit = 255;
	let description = $state("");
</script>

<Field.Field class="max-w-[640px]">
	<Field.Label for={id}>Description</Field.Label>
	<Textarea
		{id}
		bind:value={description}
		appearance="settings"
		maxlength={limit}
		aria-describedby={`${id}-count`}
		placeholder="Write a description for your team…"
	/>
	<p id={`${id}-count`} class="text-right text-xs tabular-nums text-muted-foreground">
		{description.length} / {limit} characters
	</p>
</Field.Field>
