<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	export type TickMeterProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		/** A finite percentage; graphic/ARIA clamp, visible number/valueText preserve overflow. */
		value: number;
		label: string;
		valueText: string;
		tone?: "accent" | "danger";
	};
</script>

<script lang="ts">
	// Independently authored from product requirements. Not an Arc/Arc Pro adaptation.
	import { cn } from "$lib/utils.js";
	let {
		value,
		label,
		valueText,
		tone = "accent",
		class: className,
		...rest
	}: TickMeterProps = $props();
	const bounded = $derived(Math.min(100, Math.max(0, value)));
	const filled = $derived(Math.round((bounded * 60) / 100));
	const ticks = Array.from({ length: 60 }, (_, index) => {
		const angle = ((index * 6 - 90) * Math.PI) / 180;
		return {
			x1: 50 + 36 * Math.cos(angle),
			y1: 50 + 36 * Math.sin(angle),
			x2: 50 + 44 * Math.cos(angle),
			y2: 50 + 44 * Math.sin(angle),
		};
	});
</script>

<div
	data-slot="tick-meter"
	data-tone={tone}
	role="meter"
	aria-label={label}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={bounded}
	aria-valuetext={valueText}
	class={cn("relative aspect-square w-full", className)}
	{...rest}
>
	<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" class="block size-full">
		{#each ticks as point, index}
			<line
				{...point}
				data-filled={index < filled}
				stroke-width="2.5"
				stroke-linecap="round"
				class={index < filled
					? tone === "danger"
						? "stroke-destructive"
						: "stroke-primary"
					: "stroke-border"}
			/>
		{/each}
	</svg>
	<span
		aria-hidden="true"
		class={cn(
			"pointer-events-none absolute inset-0 grid place-content-center text-2xl font-medium tabular-nums",
			tone === "danger" ? "text-destructive" : "text-foreground"
		)}
	>
		{Math.round(value)}%
	</span>
</div>
