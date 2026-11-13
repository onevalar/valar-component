<script lang="ts">
	import { onDestroy } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";

	let pending = $state(false);
	let saves = $state(0);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function save(event: SubmitEvent) {
		event.preventDefault();
		if (pending) return;
		pending = true;
		timer = setTimeout(() => {
			saves += 1;
			pending = false;
		}, 750);
	}

	onDestroy(() => clearTimeout(timer));
</script>

<form class="grid justify-items-start gap-3" onsubmit={save}>
	<div class="flex flex-wrap gap-2">
		<Button type="submit" shape="pill" loading={pending}>
			{#if pending}<Spinner data-icon="inline-start" aria-hidden="true" />{/if}
			{pending ? "Saving" : "Save changes"}
		</Button>
		<Button variant="outline" shape="pill" size="xs" disabled>Set team</Button>
	</div>
	<p role="status" class="min-h-5 text-sm text-muted-foreground">
		{pending ? "Saving changes" : saves ? `Changes saved (${saves})` : ""}
	</p>
</form>
