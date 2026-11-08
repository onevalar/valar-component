<script lang="ts">
	import { SegmentedControl } from "$lib/registry/ui/segmented-control/index.js";
	let measure = $state("tokens");
</script>

<SegmentedControl
	label="图表口径"
	bind:value={measure}
	options={[
		{ value: "tokens", label: "Token" },
		{ value: "cost", label: "费用" },
	]}
/>
