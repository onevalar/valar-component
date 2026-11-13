<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
	let identifier = $state("");
</script>

<Field.Group class="max-w-2xl rounded-[10px] border border-border bg-card">
	<Field.Field appearance="settings" orientation="responsive">
		<Field.Content>
			<Field.Label for={id}>Identifier</Field.Label>
			<Field.Description id={`${id}-description`}
				>Issues use this prefix, for example {identifier || "ENG"}-123.</Field.Description
			>
		</Field.Content>
		<Input
			{id}
			aria-describedby={`${id}-description`}
			autocomplete="off"
			autocapitalize="characters"
			spellcheck={false}
			maxlength={7}
			placeholder="e.g. ENG"
			value={identifier}
			oninput={({ currentTarget }) => {
				const { selectionStart, selectionEnd, value } = currentTarget;
				const normalized = value.toUpperCase().slice(0, 7);
				if (normalized !== value) {
					currentTarget.value = normalized;
					currentTarget.setSelectionRange(selectionStart, selectionEnd);
				}
				identifier = normalized;
			}}
			class="max-w-full @md/field-group:max-w-[172.5px] @md/field-group:basis-[172.5px]"
		/>
	</Field.Field>
</Field.Group>
