<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	export type StaticSparklineProps = Omit<SVGAttributes<SVGSVGElement>, "children" | "values"> & {
		values: (number | null)[];
		appearance?: "default" | "project";
	};
</script>

<script lang="ts">
	// Arc free Sparkline geometry adaptation; copyright (c) 2026 Elia Kuratli, MIT (LICENSE.md).
	import { cn } from "$lib/utils.js";
	let { values, appearance = "default", class: className, ...rest }: StaticSparklineProps = $props();
	const uid = $props.id();
	const gradientId = `${uid}-sparkline-fade`;
	const project = $derived(appearance === "project");
	const plotWidth = $derived(project ? 104 : 72);
	const plotHeight = $derived(project ? 32 : 40);
	const padding = 4;
	const baseline = $derived(plotHeight - padding);
	const samples = $derived(
		values.map((value) => (value !== null && Number.isFinite(value) && value >= 0 ? value : null))
	);
	const maximum = $derived(samples.reduce<number>((max, value) => Math.max(max, value ?? 0), 1));
	const points = $derived(
		samples.map((value, index) =>
			value === null
				? null
				: {
						x: padding + (index / Math.max(1, samples.length - 1)) * (plotWidth - 2 * padding),
						y: baseline - (value / maximum) * (plotHeight - 2 * padding),
					}
		)
	);
	type Point = NonNullable<(typeof points)[number]>;
	const coordinates = ({ x, y }: Point) => `${x.toFixed(2)},${y.toFixed(2)}`;
	const path = $derived(
		points
			.map((point, index) =>
				point
					? `${index > 0 && points[index - 1] ? "L" : "M"}${coordinates(point)}`
					: ""
			)
			.join(" ")
	);
	const lastSample = $derived(points.findLastIndex((point) => point !== null));
	const area = $derived.by(() => {
		const paths: string[] = [];
		const run: Point[] = [];
		for (const point of [...points, null]) {
			if (point) {
				run.push(point);
				continue;
			}
			const first = run[0];
			const last = run.at(-1);
			// Close each connected run independently. Isolated points and all-zero runs have no area.
			if (first && last && first !== last && run.some(({ y }) => y < baseline)) {
				const line = run.map(coordinates).join(" L");
				paths.push(`M${line} V${baseline} H${first.x.toFixed(2)} Z`);
			}
			run.length = 0;
		}
		return paths.join(" ");
	});
</script>

<svg
	data-slot="static-sparkline"
	data-appearance={appearance}
	viewBox={`0 0 ${plotWidth} ${plotHeight}`}
	width={project ? 104 : 50.4}
	height={project ? 32 : 28}
	aria-hidden="true"
	focusable="false"
	class={cn(project ? "text-[#5e69d1]" : "text-primary", className)}
	{...rest}
>
	{#if project && area}
		<defs>
			<linearGradient
				id={gradientId}
				x1="0"
				x2="0"
				y1={padding}
				y2={baseline}
				gradientUnits="userSpaceOnUse"
			>
				<stop offset="0" stop-color="currentColor" stop-opacity="0.22" />
				<stop offset="1" stop-color="currentColor" stop-opacity="0" />
			</linearGradient>
		</defs>
		<path data-slot="sparkline-area" d={area} fill={`url(#${gradientId})`} />
	{/if}
	<path
		data-slot="sparkline-line"
		d={path}
		fill="none"
		stroke="currentColor"
		stroke-width={project ? 1.5 : 2.5}
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	{#each points as point, index}
		{@const isolated = !points[index - 1] && !points[index + 1]}
		{#if point && (!project || index === lastSample || isolated)}
			<circle
				data-slot="sparkline-point"
				cx={point.x}
				cy={point.y}
				r={project || index === points.length - 1 || isolated ? 2 : 1.25}
				fill="currentColor"
			/>
		{/if}
	{/each}
</svg>
