<script lang="ts">
	import { SliderField } from "$lib/registry/ui/slider-field/index.js";

	let contrast = $state(30);
</script>

<div class="grid w-full max-w-[640px] gap-2">
	<SliderField
		label="Contrast"
		appearance="readout"
		bind:value={contrast}
		min={15}
		max={100}
		class="rounded-[10px] border border-border bg-card dark:bg-[#151515]"
	/>
	<SliderField
		label="Contrast (disabled)"
		appearance="readout"
		value={30}
		min={15}
		max={100}
		disabled
		class="rounded-[10px] border border-border bg-card dark:bg-[#151515]"
	/>
</div>
