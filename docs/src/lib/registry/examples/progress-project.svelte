<script lang="ts">
	import { Progress } from "$lib/registry/ui/progress/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";

	const labelId = $props.id();
	let value = $state(0);
</script>

<div class="grid w-full max-w-xs gap-3">
	<div class="flex items-center justify-between gap-2">
		<span id={labelId} class="text-sm font-medium">Project progress</span>
		<Progress appearance="project" {value} aria-labelledby={labelId} />
	</div>
	<Slider type="single" bind:value min={0} max={100} step={5} aria-label="Adjust project progress" />
</div>
