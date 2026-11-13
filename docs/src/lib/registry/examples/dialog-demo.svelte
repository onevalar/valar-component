<script lang="ts">
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const id = $props.id();
	let open = $state(false);
	let savedTitle = $state("Review the onboarding flow");
	let savedDescription = $state("Collect feedback from the product team.");
	let draftTitle = $state("");
	let draftDescription = $state("");
	let status = $state("");

	function prepareDraft(nextOpen: boolean) {
		if (!nextOpen) return;
		draftTitle = savedTitle;
		draftDescription = savedDescription;
	}

	function saveDraft(event: SubmitEvent) {
		event.preventDefault();
		const title = draftTitle.trim();
		if (!title) return;
		savedTitle = title;
		savedDescription = draftDescription.trim();
		status = `Saved: ${title}`;
		open = false;
	}
</script>

<div class="grid justify-items-center gap-3">
	<Dialog.Root bind:open onOpenChange={prepareDraft}>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Edit draft</Button>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content appearance="editor" closeLabel="Close">
			<form class="flex min-w-0 flex-col" onsubmit={saveDraft}>
				<Dialog.Header class="h-14 shrink-0 justify-center ps-[19px] pe-12">
					<Dialog.Title class="text-[13px] leading-5">Edit draft</Dialog.Title>
					<Dialog.Description class="sr-only"
						>Edit the title and description of this example draft.</Dialog.Description
					>
				</Dialog.Header>
				<div class="flex flex-1 flex-col gap-2 px-[19px] pb-2">
					<Label class="sr-only" for={`${id}-title`}>Title</Label>
					<Input
						id={`${id}-title`}
						bind:value={draftTitle}
						required
						class="rounded-none border-0 bg-transparent! px-0 text-[18px]! font-semibold shadow-none! focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid"
					/>
					<Label class="sr-only" for={`${id}-description`}>Description</Label>
					<Textarea
						id={`${id}-description`}
						bind:value={draftDescription}
						class="flex-1 resize-none rounded-none border-0 bg-transparent! px-0 text-[15px]! shadow-none! focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid"
					/>
				</div>
				<Dialog.Footer>
					<Dialog.Close>
						{#snippet child({ props })}
							<Button {...props} variant="outline" shape="pill">Cancel</Button>
						{/snippet}
					</Dialog.Close>
					<Button type="submit" shape="pill" disabled={!draftTitle.trim()}>Save changes</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<p role="status" class="min-h-5 text-xs text-muted-foreground">{status}</p>
</div>
