<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	export type RulerSliderProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		label: string;
		value?: number;
		defaultValue?: number;
		onValueChange?: (value: number) => void;
		onValueCommit?: (value: number) => void;
		min?: number;
		max?: number;
		step?: number;
		largeStep?: number;
		majorEvery?: number;
		spacing?: number;
		format?: (value: number) => string;
		/** Tape motion is native; the financial readout is synchronous (rolling digits not provided). */
		animateReadout?: false;
		unit?: string;
		name?: string;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { cn } from "$lib/utils.js";
	import { createRulerMotion, decimalsOf, snap } from "./motion.js";
	let {
		label,
		defaultValue,
		min = 0,
		max = 100,
		step = 1,
		largeStep,
		majorEvery = 10,
		spacing = 10,
		format,
		animateReadout: _animateReadout = false,
		unit,
		name,
		disabled = false,
		value = $bindable(defaultValue ?? min),
		onValueChange,
		onValueCommit,
		class: className,
		...rest
	}: RulerSliderProps = $props();
	const id = $props.id();
	const safeStep = $derived(step > 0 ? step : 1);
	const decimals = $derived(Math.max(decimalsOf(min), decimalsOf(safeStep)));
	const current = $derived(snap(value, min, max, safeStep));
	const readout = $derived(
		format
			? format(current)
			: current.toLocaleString("en-US", {
					minimumFractionDigits: decimals,
					maximumFractionDigits: decimals,
				})
	);
	const major = $derived(safeStep * majorEvery);
	const marks = $derived(
		Array.from({ length: Math.floor((max - min) / major + 1e-9) + 1 }, (_, index) =>
			Number((min + index * major).toFixed(decimals))
		)
	);
	const labelFormat = (mark: number) =>
		format
			? format(mark)
			: mark.toLocaleString("en-US", {
					maximumFractionDigits: decimalsOf(Number(major.toFixed(decimals))),
				});
	let viewport: HTMLDivElement;
	let position = $state(untrack(() => current));
	let dragging = $state(false);
	let motion: ReturnType<typeof createRulerMotion> | undefined;
	$effect(() => {
		const node = viewport;
		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
		const controller = untrack(() =>
			createRulerMotion(node, current, {
				get: () => ({
					min,
					max,
					step: safeStep,
					spacing,
					largeStep: largeStep ?? major,
					disabled,
					reduced: preference.matches,
				}),
				position: (next) => (position = next),
				dragging: (next) => (dragging = next),
				change: (next) => {
					value = next;
					onValueChange?.(next);
				},
				commit: (next) => onValueCommit?.(next),
			})
		);
		motion = controller;
		const changed = () => controller.preferenceChanged();
		preference.addEventListener("change", changed);
		return () => {
			controller.destroy();
			preference.removeEventListener("change", changed);
			motion = undefined;
		};
	});
	$effect(() => {
		const next = current,
			inactive = disabled;
		untrack(() => motion?.sync(next, inactive));
	});
</script>

<div
	data-slot="ruler-slider"
	data-disabled={disabled || undefined}
	data-dragging={dragging || undefined}
	class={cn(
		"grid w-full min-w-0 justify-items-center gap-1 text-sm text-foreground select-none data-disabled:opacity-50",
		className
	)}
	{...rest}
>
	<span id={`${id}-label`} class="text-muted-foreground">{label}</span>
	<div
		aria-hidden="true"
		class="mb-3 inline-flex items-baseline gap-[0.3em] text-2xl leading-[1.1] font-medium tabular-nums"
	>
		<span>{readout}</span>{#if unit}<span class="text-base text-muted-foreground">{unit}</span>{/if}
	</div>
	<div
		bind:this={viewport}
		data-slot="ruler-slider-viewport"
		role="slider"
		tabindex={disabled ? -1 : 0}
		aria-labelledby={`${id}-label`}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={current}
		aria-valuetext={unit ? `${readout} ${unit}` : readout}
		aria-orientation="horizontal"
		aria-disabled={disabled || undefined}
		class="relative h-18 w-full cursor-grab touch-pan-y overflow-hidden rounded-lg border bg-background outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring in-data-[disabled]:cursor-not-allowed in-data-[dragging]:cursor-grabbing"
	>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,transparent,#000_22%,#000_78%,transparent)]"
		>
			<div
				data-slot="ruler-slider-tape"
				class="absolute inset-y-0 left-[calc(50%-0.5px)] will-change-transform"
				style:width={`${((max - min) * spacing) / safeStep + 1}px`}
				style:transform={`translateX(${(-(position - min) * spacing) / safeStep}px)`}
				style:--spacing={`${spacing}px`}
				style:--major={`${spacing * majorEvery}px`}
				style:--half={majorEvery % 2 === 0 ? `${(spacing * majorEvery) / 2}px` : "0px"}
			>
				<!-- Inline, not a <style> block: this component is installed on its own and its CSS must travel with it. -->
				<span
					class="absolute inset-x-0 top-0 h-7"
					style="--tick: color-mix(in oklab, var(--foreground) 20%, transparent); --tick-major: color-mix(in oklab, var(--foreground) 48%, transparent); background-image: linear-gradient(to right, var(--tick-major) 0 1px, transparent 1px), linear-gradient(to right, var(--tick) 0 1px, transparent 1px), linear-gradient(to right, var(--tick) 0 1px, transparent 1px); background-repeat: repeat-x; background-size: var(--major) 1.75rem, var(--half) 1.25rem, var(--spacing) 0.75rem;"
				></span>
				{#each marks as mark, index}
					<span
						class="absolute top-9 -translate-x-1/2 text-xs whitespace-nowrap text-muted-foreground tabular-nums"
						style:left={`${index * spacing * majorEvery}px`}>{labelFormat(mark)}</span
					>
				{/each}
			</div>
		</div>
		<span
			aria-hidden="true"
			data-slot="ruler-slider-needle"
			class="pointer-events-none absolute top-0 left-[calc(50%-1px)] h-9 w-0.5 rounded-b-full bg-primary"
		></span>
	</div>
	{#if name}<input type="hidden" {name} value={current} {disabled} />{/if}
</div>
