<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	export type StaticSparklineProps = Omit<SVGAttributes<SVGSVGElement>, "children" | "values"> & {
		values: (number | null)[];
	};
</script>

<script lang="ts">
	// Arc free Sparkline geometry adaptation; copyright (c) 2026 Elia Kuratli, MIT (LICENSE.md).
	import { cn } from "$lib/utils.js";
	let { values, class: className, ...rest }: StaticSparklineProps = $props();
	const maximum = $derived(Math.max(1, ...values.filter((n): n is number => n !== null)));
	const points = $derived(
		values.map((value, index) =>
			value === null
				? null
				: {
						x: 4 + (index / Math.max(1, values.length - 1)) * 64,
						y: 36 - (value / maximum) * 32,
					}
		)
	);
	const path = $derived(
		points
			.map((point, index) =>
				point
					? `${index > 0 && points[index - 1] ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`
					: ""
			)
			.join(" ")
	);
</script>

<svg
	data-slot="static-sparkline"
	viewBox="0 0 72 40"
	width="50.4"
	height="28"
	aria-hidden="true"
	focusable="false"
	class={cn("text-primary", className)}
	{...rest}
>
	<path
		d={path}
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	{#each points as point, index}
		{#if point}
			<circle
				cx={point.x}
				cy={point.y}
				r={index === points.length - 1 || (!points[index - 1] && !points[index + 1]) ? 2 : 1.25}
				fill="currentColor"
			/>
		{/if}
	{/each}
</svg>
