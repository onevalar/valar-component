<script lang="ts">
	import { onDestroy } from "svelte";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";

	const id = $props.id();
	let open = $state(false);
	let pending = $state(false);
	let failed = $state(false);
	let savedName = $state("Product team");
	let draftName = $state("");
	let status = $state("");
	let timer: ReturnType<typeof setTimeout>;

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const name = draftName.trim();
		if (!name || pending) return;
		pending = true;
		timer = setTimeout(() => {
			pending = false;
			if (!failed) {
				failed = true;
				return;
			}
			savedName = name;
			status = `Saved settings for ${name}.`;
			open = false;
		}, 600);
	}

	function preventCloseWhileSaving(event: Event) {
		if (pending) event.preventDefault();
	}

	onDestroy(() => clearTimeout(timer));
</script>

<div class="grid justify-items-center gap-3">
	<Dialog.Root
		bind:open
		onOpenChange={(nextOpen) => {
			if (nextOpen) {
				draftName = savedName;
				failed = false;
				status = "";
			}
		}}
	>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Edit settings</Button>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content
			showCloseButton={false}
			onEscapeKeydown={preventCloseWhileSaving}
			onInteractOutside={preventCloseWhileSaving}
		>
			<Dialog.Header>
				<Dialog.Title>Edit project settings</Dialog.Title>
				<Dialog.Description>Change the name shown to the project team.</Dialog.Description>
			</Dialog.Header>
			<form class="grid gap-4" onsubmit={submit} aria-busy={pending}>
				<div class="grid gap-2">
					<Label for={`${id}-project-name`}>Project name</Label>
					<Input id={`${id}-project-name`} bind:value={draftName} readonly={pending} required />
				</div>
				{#if failed && !pending}
					<p role="alert" class="text-sm text-destructive">
						Could not save your settings. Try again.
					</p>
				{/if}
				<Dialog.Footer>
					<Dialog.Close>
						{#snippet child({ props })}
							<Button {...props} disabled={pending} shape="pill" variant="outline">Cancel</Button>
						{/snippet}
					</Dialog.Close>
					<Button type="submit" disabled={!draftName.trim()} loading={pending} shape="pill">
						{#if pending}<Spinner aria-hidden="true" />{/if}
						{pending ? "Saving…" : failed ? "Retry save" : "Save"}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<p role="status" class="min-h-5 text-xs text-muted-foreground">{status}</p>
</div>
