<script lang="ts">
	import { WaffleChart } from "$lib/registry/ui/waffle-chart/index.js";
	const data = [
		{ key: "a", value: 65, color: "var(--chart-1)" },
		{ key: "b", value: 35, color: "var(--chart-2)" },
	];
</script>

<figure
	class="grid w-52 gap-3 rounded-[10px] border-[0.5px] border-border bg-card p-3.5 shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
>
	<WaffleChart {data} label="100 个格子代表总量；精确值在图例中" />
	<figcaption class="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
		<span class="inline-flex items-center gap-1.5">
			<span class="size-2 rounded-[2px] bg-[var(--chart-1)]" aria-hidden="true"></span>
			<span class="font-medium text-foreground">A</span> 65
		</span>
		<span class="inline-flex items-center gap-1.5">
			<span class="size-2 rounded-[2px] bg-[var(--chart-2)]" aria-hidden="true"></span>
			<span class="font-medium text-foreground">B</span> 35
		</span>
	</figcaption>
</figure>
