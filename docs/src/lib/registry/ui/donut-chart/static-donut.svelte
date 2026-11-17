<script lang="ts" module>
	import type { DonutPart } from "./geometry.js";
	import type { SVGAttributes } from "svelte/elements";
	export type StaticDonutProps = Omit<SVGAttributes<SVGSVGElement>, "children"> & {
		parts: DonutPart[];
		total: number;
	};
</script>

<script lang="ts">
	import { sector } from "./geometry.js";
	let { parts, total, class: className, ...rest }: StaticDonutProps = $props();
	const hasTotal = $derived(Number.isFinite(total) && total > 0);
	const slices = $derived.by(() => {
		if (!hasTotal) return [];
		let used = 0;
		return parts.flatMap((part) => {
			if (!Number.isFinite(part.value) || part.value < 0) return [];
			const start = used / total;
			used = Math.min(total, used + part.value);
			return [{ ...part, start, end: used / total }];
		});
	});
</script>

<svg
	data-slot="static-donut"
	viewBox="0 0 208 208"
	width="208"
	class={["max-w-full", className]}
	aria-hidden="true"
	focusable="false"
	{...rest}
>
	{#if hasTotal && (slices.at(-1)?.end ?? 0) < 1}
		<circle
			data-slot="static-donut-track"
			cx="104"
			cy="104"
			r="85"
			stroke-width="24"
			stroke="currentColor"
			fill="none"
			class="text-muted-foreground/20"
		/>
	{/if}
	{#each slices as part (part.key)}
		<path
			data-part={part.key}
			data-start={part.start}
			data-end={part.end}
			data-value={part.value}
			d={sector(104, 97, 73, part.start, part.end)}
			fill={part.color}
		/>
	{/each}
</svg>
