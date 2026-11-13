<script lang="ts">
	import { onDestroy } from "svelte";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";

	const id = $props.id();
	let slug = $state("");
	let result = $state<"idle" | "checking" | "unavailable" | "available">("idle");
	let timer: ReturnType<typeof setTimeout> | undefined;

	function reset() {
		clearTimeout(timer);
		result = "idle";
	}

	function check(event: SubmitEvent) {
		event.preventDefault();
		const name = slug.trim().toLowerCase();
		if (!name || result === "checking") return;
		result = "checking";
		timer = setTimeout(() => {
			result = name === "design" ? "unavailable" : "available";
		}, 500);
	}

	onDestroy(() => clearTimeout(timer));
</script>

<form class="grid w-full max-w-sm gap-4" onsubmit={check}>
	<Field.Field data-invalid={result === "unavailable" ? true : undefined}>
		<Field.Label for={id}>Workspace URL</Field.Label>
		<InputGroup.Root aria-busy={result === "checking"}>
			<InputGroup.Input
				{id}
				bind:value={slug}
				placeholder="design"
				aria-invalid={result === "unavailable" ? true : undefined}
				aria-describedby={result === "unavailable" ? `${id}-error` : `${id}-hint`}
				oninput={reset}
			/>
			<InputGroup.Addon aria-hidden="true">
				<InputGroup.Text>valar.test/</InputGroup.Text>
			</InputGroup.Addon>
			<InputGroup.Addon align="inline-end">
				<Spinner
					aria-hidden="true"
					class={result === "checking" ? "motion-reduce:animate-none" : "invisible animate-none"}
				/>
				<InputGroup.Button type="submit" disabled={!slug.trim() || result === "checking"}>
					Check
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
		<Field.Description id={`${id}-hint`}>Try “design” to see the unavailable state.</Field.Description>
		{#if result === "unavailable"}
			<Field.Error id={`${id}-error`}>This workspace URL is already taken.</Field.Error>
		{/if}
		<p role="status" class="text-sm">
			{result === "checking" ? "Checking availability…" : result === "available" ? "This URL is available." : ""}
		</p>
	</Field.Field>
	<Field.Field data-disabled>
		<Field.Label for={`${id}-disabled`}>Managed workspace URL</Field.Label>
		<InputGroup.Root>
			<InputGroup.Input id={`${id}-disabled`} value="engineering" disabled />
			<InputGroup.Addon aria-hidden="true"><InputGroup.Text>valar.test/</InputGroup.Text></InputGroup.Addon>
		</InputGroup.Root>
	</Field.Field>
</form>
