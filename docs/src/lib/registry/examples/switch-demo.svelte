<script lang="ts">
	import { Label } from "$lib/registry/ui/label/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	const id = $props.id();
</script>

<div class="flex items-center space-x-2">
	<Switch {id} />
	<Label for={id}>Airplane mode</Label>
</div>
