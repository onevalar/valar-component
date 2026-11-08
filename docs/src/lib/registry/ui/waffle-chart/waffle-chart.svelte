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
	role="img"
	aria-label={label}
	class={cn("grid aspect-square w-full grid-cols-10 grid-rows-10 gap-[3px]", className)}
	{...rest}
>
	{#each cells as cell, index}
		<span
			aria-hidden="true"
			data-category={cell.key}
			class="min-h-0 min-w-0 rounded-[22%]"
			style:grid-column={Math.floor(index / 10) + 1}
			style:grid-row={10 - (index % 10)}
			style:background={cell.color}
		></span>
	{/each}
</div>
