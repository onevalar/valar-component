<script lang="ts">
	import { Label } from "$lib/registry/ui/label/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
</script>

<div class="grid w-full max-w-xs gap-2">
	<Label for={id}>Display name</Label>
	<Input {id} placeholder="Jordan Lee" />
</div>
