<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { arcFor } from "./geometry.js";

	const capacityTrack = arcFor(1, 7, 8, 306);

	export type GaugeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		value: number;
		label: string;
		valueText: string;
		tone?: "accent" | "danger";
		appearance?: "default" | "capacity";
		suffix?: string;
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
		appearance = "default",
		suffix,
		class: className,
		...rest
	}: GaugeProps = $props();
	const clampedValue = $derived(Math.min(100, Math.max(0, value)));
	const capacity = $derived(appearance === "capacity");
	const resolvedTone = $derived(capacity && value > 100 ? "danger" : tone);
	// Keep a visible rounded endpoint at zero.
	const capacityValue = $derived(arcFor(Math.max(0.002, clampedValue / 100), 7, 8, 306));
</script>

<div
	data-slot="gauge"
	data-appearance={capacity ? "capacity" : undefined}
	data-tone={resolvedTone}
	role="meter"
	aria-label={label}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={clampedValue}
	aria-valuetext={valueText}
	class={cn(
		capacity
			? "inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px]/[15.5px]"
			: "relative aspect-[100/90] w-full",
		className,
	)}
	{...rest}
>
	{#if capacity}
		<span aria-hidden="true" class="inline-flex shrink-0 items-center gap-2">
			<svg
				viewBox="0 0 16 16"
				aria-hidden="true"
				focusable="false"
				fill="none"
				stroke-width="2"
				stroke-linecap="round"
				class="size-4 shrink-0"
			>
				<path
					data-slot="gauge-capacity-track"
					d={capacityTrack}
					class="stroke-[lch(88.49%_0_282)] dark:stroke-[lch(14.16%_1.48_272)]"
				/>
				<path
					data-slot="gauge-capacity-value"
					d={capacityValue}
					class={resolvedTone === "danger"
						? "stroke-[lch(58%_73_29)]"
						: "stroke-[lch(48%_59.31_288.43)]"}
				/>
			</svg>
			<span
				data-slot="gauge-capacity-number"
				class="font-medium tabular-nums text-[color:lch(19.588%_1.25_282)] dark:text-[color:lch(90.451%_1.2_272)]"
			>
				{value}%
			</span>
		</span>
		{#if suffix}
			<span
				data-slot="gauge-capacity-suffix"
				aria-hidden="true"
				class="min-w-0 font-[450] wrap-anywhere text-[color:lch(39.176%_1.25_282)] dark:text-[color:lch(61.803%_1.2_272)]"
			>
				{suffix}
			</span>
		{/if}
	{:else}
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
					tone === "danger" ? "text-destructive" : "text-foreground",
				)}
			>
				{Math.round(value)}<span class="ms-px text-[0.5em]">%</span>
			</span>
		</div>
	{/if}
</div>
