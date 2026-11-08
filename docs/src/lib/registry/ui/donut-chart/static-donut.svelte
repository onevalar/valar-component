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
	let { parts, total, ...rest }: StaticDonutProps = $props();
	const slices = $derived.by(() => {
		let used = 0;
		return parts.map((part) => {
			const start = used / total;
			used += part.value;
			return { ...part, start, end: used / total };
		});
	});
</script>

<svg data-slot="static-donut" viewBox="0 0 208 208" aria-hidden="true" focusable="false" {...rest}>
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
