<script lang="ts" module>
	import type { WaffleCategory } from "./allocation.js";
	import type { HTMLAttributes } from "svelte/elements";
	export type WaffleChartProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		data: WaffleCategory[];
		label: string;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { allocate } from "./allocation.js";
	let { data, label, class: className, ...rest }: WaffleChartProps = $props();
	const cells = $derived.by(() => {
		const counts = allocate(data);
		return data.flatMap((item, index) => Array.from({ length: counts[index] }, () => item));
	});
</script>

<div
	data-slot="waffle-chart"
	data-empty={cells.length === 0 ? "" : undefined}
	role="img"
	aria-label={label}
	class={cn(
		"grid aspect-square w-full min-w-0 grid-cols-10 grid-rows-10 gap-[min(3px,1.5%)]",
		"data-empty:rounded-lg data-empty:border data-empty:border-dashed data-empty:bg-muted/30",
		className
	)}
	{...rest}
>
	{#each cells as cell, index}
		<span
			aria-hidden="true"
			data-category={cell.key}
			class="min-h-0 min-w-0 rounded-[min(3px,22%)]"
			style:grid-column={Math.floor(index / 10) + 1}
			style:grid-row={10 - (index % 10)}
			style:background={cell.color}
		></span>
	{/each}
</div>
