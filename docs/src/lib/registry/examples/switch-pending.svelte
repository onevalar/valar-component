<script lang="ts">
	import { onDestroy, tick } from "svelte";
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	const id = $props.id();
	let checked = $state(false);
	let pending = $state(false);
	let status = $state("");
	let control = $state<HTMLButtonElement | null>(null);
	let timeout: ReturnType<typeof setTimeout> | undefined;

	function save(next: boolean) {
		const restoreFocus = document.activeElement === control;
		checked = next;
		pending = true;
		status = "Saving changes…";
		timeout = setTimeout(async () => {
			pending = false;
			status = "Preference saved.";
			await tick();
			if (restoreFocus && document.activeElement === document.body) control?.focus();
		}, 650);
	}

	onDestroy(() => clearTimeout(timeout));
</script>

<Field.Field orientation="horizontal" appearance="settings" class="max-w-sm rounded-lg border">
	<Field.Content>
		<Field.Label for={id}>Product updates</Field.Label>
		<Field.Description id={`${id}-description`}
			>Apply this preference immediately.</Field.Description
		>
		<p role="status" class="text-xs text-muted-foreground">{status}</p>
	</Field.Content>
	<Switch
		{id}
		bind:ref={control}
		bind:checked={() => checked, save}
		disabled={pending}
		aria-busy={pending}
		aria-describedby={`${id}-description`}
	/>
</Field.Field>
