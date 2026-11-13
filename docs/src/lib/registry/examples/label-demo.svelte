<script lang="ts">
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";

	const id = $props.id();
	let subscribed = $state(false);
</script>

<div class="grid w-full max-w-xs gap-2">
	<Label for={id} appearance="settings">Display name</Label>
	<Input {id} autocomplete="name" placeholder="Name shown in the workspace" />
	<Label for={`${id}-email`} required>Email</Label>
	<Input id={`${id}-email`} type="email" autocomplete="email" required />
	<Label for={`${id}-workspace`} data-disabled="true">Workspace ID</Label>
	<Input id={`${id}-workspace`} value="WKS-42" disabled />
	<div class="flex items-center gap-2">
		<Checkbox id={`${id}-updates`} bind:checked={subscribed} />
		<Label for={`${id}-updates`}>Receive product updates</Label>
	</div>
</div>
