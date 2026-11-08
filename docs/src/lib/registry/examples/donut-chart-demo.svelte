<script lang="ts">
	import { StaticDonut, type DonutPart } from "$lib/registry/ui/donut-chart/index.js";
	const parts: DonutPart[] = [
		{ key: "a", value: 65, color: "var(--chart-1)" },
		{ key: "b", value: 35, color: "var(--chart-2)" },
	];
</script>

<figure class="grid w-48 gap-3">
	<StaticDonut {parts} total={100} />
	<figcaption class="text-sm">A：65 · B：35 · 总量：100</figcaption>
</figure>
