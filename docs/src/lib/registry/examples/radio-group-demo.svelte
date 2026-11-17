<script lang="ts">
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";
	const id = $props.id();
</script>

<RadioGroup.Root value="comfortable" aria-label="Display density" class="w-fit">
	<div class="flex items-center gap-3">
		<RadioGroup.Item value="default" id={`${id}-default`} />
		<Label for={`${id}-default`}>Default</Label>
	</div>
	<div class="flex items-center gap-3">
		<RadioGroup.Item value="comfortable" id={`${id}-comfortable`} />
		<Label for={`${id}-comfortable`}>Comfortable</Label>
	</div>
	<div class="flex items-center gap-3">
		<RadioGroup.Item value="compact" id={`${id}-compact`} />
		<Label for={`${id}-compact`}>Compact</Label>
	</div>
</RadioGroup.Root>
