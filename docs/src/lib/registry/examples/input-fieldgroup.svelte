<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
	let submitted = $state(false);
</script>

<form
	class="w-full max-w-xs"
	onreset={() => (submitted = false)}
	onsubmit={(event) => {
		event.preventDefault();
		submitted = true;
	}}
>
	<Field.Group>
		<Field.Field>
			<Field.Label for={`${id}-name`}>Name</Field.Label>
			<Input id={`${id}-name`} name="name" placeholder="Jordan Lee" required />
		</Field.Field>
		<Field.Field>
			<Field.Label for={`${id}-email`}>Email</Field.Label>
			<Input
				id={`${id}-email`}
				name="email"
				type="email"
				placeholder="name@example.com"
				aria-describedby={`${id}-email-description`}
			/>
			<Field.Description id={`${id}-email-description`}
				>Receives workspace updates.</Field.Description
			>
		</Field.Field>
		<Field.Field orientation="horizontal">
			<Button type="reset" variant="outline">Reset</Button>
			<Button type="submit">Submit</Button>
		</Field.Field>
		{#if submitted}<p role="status" class="text-muted-foreground text-xs">
				Preview submitted.
			</p>{/if}
	</Field.Group>
</form>
