<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	export type GaugeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		value: number;
		label: string;
		valueText: string;
		tone?: "accent" | "danger";
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import GaugeArc from "./gauge-arc.svelte";
	let {
		value,
		label,
		valueText,
		tone = "accent",
		class: className,
		...rest
	}: GaugeProps = $props();
</script>

<div
	data-slot="gauge"
	data-tone={tone}
	role="meter"
	aria-label={label}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.min(100, Math.max(0, value))}
	aria-valuetext={valueText}
	class={cn("relative aspect-[100/90] w-full", className)}
	{...rest}
>
	<svg
		viewBox="0 0 100 90"
		aria-hidden="true"
		focusable="false"
		class="block size-full overflow-visible"
	>
		<GaugeArc {value} {tone} />
	</svg>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-x-0 top-0 grid aspect-square place-content-center"
	>
		<span
			class={cn(
				"text-2xl font-medium tabular-nums",
				tone === "danger" ? "text-destructive" : "text-foreground"
			)}
		>
			{Math.round(value)}<span class="ms-px text-[0.5em]">%</span>
		</span>
	</div>
</div>
