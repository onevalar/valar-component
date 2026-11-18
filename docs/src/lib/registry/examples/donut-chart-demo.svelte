<script lang="ts">
	import { StaticDonut, type DonutPart } from "$lib/registry/ui/donut-chart/index.js";
	const parts: DonutPart[] = [
		{ key: "a", value: 65, color: "var(--chart-1)" },
		{ key: "b", value: 35, color: "var(--chart-2)" },
	];
</script>

<figure
	class="grid w-52 gap-3 rounded-[10px] border-[0.5px] border-border bg-card p-3.5 shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
>
	<StaticDonut {parts} total={100} />
	<figcaption class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
		<span class="inline-flex items-center gap-1.5">
			<span class="size-2 rounded-[2px] bg-[var(--chart-1)]" aria-hidden="true"></span>
			<span class="font-medium text-foreground">A</span> 65
		</span>
		<span class="inline-flex items-center gap-1.5">
			<span class="size-2 rounded-[2px] bg-[var(--chart-2)]" aria-hidden="true"></span>
			<span class="font-medium text-foreground">B</span> 35
		</span>
		<span class="ms-auto">总量 100</span>
	</figcaption>
</figure>
