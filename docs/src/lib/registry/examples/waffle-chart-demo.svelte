<script lang="ts">
	import { WaffleChart } from "$lib/registry/ui/waffle-chart/index.js";
	const data = [
		{ key: "a", value: 65, color: "var(--chart-1)" },
		{ key: "b", value: 35, color: "var(--chart-2)" },
	];
</script>

<figure class="grid w-48 gap-3">
	<WaffleChart {data} label="100 个格子代表总量；精确值在图例中" />
	<figcaption class="text-sm">A：65 · B：35</figcaption>
</figure>
