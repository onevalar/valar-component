<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	export type GaugeArcProps = Omit<SVGAttributes<SVGGElement>, "children"> & {
		value: number | null;
		radius?: number;
		tone?: "accent" | "danger";
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { arcFor } from "./geometry.js";
	let { value, radius = 42, tone = "accent", class: className, ...rest }: GaugeArcProps = $props();
	const percentage = $derived(value === null ? 0 : Math.min(1, Math.max(0, value / 100)));
</script>

<g
	data-slot="gauge-arc"
	data-tone={tone}
	data-missing={value === null}
	class={cn("fill-none stroke-9 [stroke-linecap:round]", className)}
	{...rest}
>
	<path
		d={arcFor(1, radius)}
		class="stroke-border"
		stroke-dasharray={value === null ? "3 6" : undefined}
		stroke-linecap={value === null ? "butt" : undefined}
	/>
	{#if percentage > 0}
		<path
			d={arcFor(percentage, radius)}
			opacity={Math.min(1, percentage / 0.02)}
			class={tone === "danger" ? "stroke-destructive" : "stroke-primary"}
		/>
	{/if}
</g>
