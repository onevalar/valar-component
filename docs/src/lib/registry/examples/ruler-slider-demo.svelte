<script lang="ts">
	import { RulerSlider } from "$lib/registry/ui/ruler-slider/index.js";
	let reference = $state(50);
</script>

<RulerSlider
	label="参考预算"
	bind:value={reference}
	min={0}
	max={100}
	step={1}
	majorEvery={10}
	unit="USD"
	animateReadout={false}
	class="w-full max-w-md"
/>
