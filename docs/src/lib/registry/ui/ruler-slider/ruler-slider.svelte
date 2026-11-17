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
	const decimals = $derived(Math.max(decimalsOf(min), decimalsOf(max), decimalsOf(safeStep)));
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
		"grid w-full min-w-0 gap-2 text-foreground select-none data-disabled:opacity-60",
		"[--ruler-accent:lch(53%_52.26_286.91)] [--ruler-border:lch(86.5%_0_282)] [--ruler-surface:white] dark:[--ruler-accent:lch(47.918%_59.303_288.421)] dark:[--ruler-border:lch(30.833%_1.93_272)] dark:[--ruler-surface:lch(9.232%_.85_272)]",
		className
	)}
	{...rest}
>
	<div class="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
		<span id={`${id}-label`} class="min-w-0 text-[13px]/5 font-medium wrap-anywhere">{label}</span>
		<div
			aria-hidden="true"
			data-slot="ruler-slider-readout"
			class="ms-auto flex min-w-0 flex-wrap items-baseline justify-end gap-x-1 text-base leading-5 font-medium wrap-anywhere tabular-nums"
		>
			<bdi class="min-w-0">{readout}</bdi>{#if unit}<span class="min-w-0 text-xs text-muted-foreground">{unit}</span>{/if}
		</div>
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
		class="relative h-16 w-full min-w-0 cursor-grab touch-pan-y overflow-hidden rounded-[8px] border border-[color:var(--valar-ruler-border,var(--ruler-border))] bg-[color:var(--valar-ruler-surface,var(--ruler-surface))] outline-none transition-[border-color,background-color] duration-150 [-webkit-tap-highlight-color:transparent] not-aria-disabled:hover:border-muted-foreground/60 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-[color:var(--valar-ruler-accent,var(--ruler-accent))] in-data-[disabled]:cursor-not-allowed in-data-[dragging]:cursor-grabbing motion-reduce:transition-none"
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
					class="absolute inset-x-0 top-2 h-6"
					style="--tick: color-mix(in oklab, var(--muted-foreground) 45%, transparent); --tick-major: var(--muted-foreground); background-image: linear-gradient(to right, var(--tick-major) 0 1px, transparent 1px), linear-gradient(to right, var(--tick) 0 1px, transparent 1px), linear-gradient(to right, var(--tick) 0 1px, transparent 1px); background-repeat: repeat-x; background-size: var(--major) 1.5rem, var(--half) 1rem, var(--spacing) 0.5rem;"
				></span>
				{#each marks as mark, index}
					<span
						data-slot="ruler-slider-mark"
						class="absolute top-10 w-[max(0px,calc(var(--major)-0.5rem))] -translate-x-1/2 truncate text-center text-xs leading-4 text-muted-foreground tabular-nums"
						style:left={`${index * spacing * majorEvery}px`}>{labelFormat(mark)}</span
					>
				{/each}
			</div>
		</div>
		<span
			aria-hidden="true"
			data-slot="ruler-slider-needle"
			class="pointer-events-none absolute top-0 left-[calc(50%-1px)] h-8 w-0.5 rounded-b-full bg-[color:var(--valar-ruler-accent,var(--ruler-accent))]"
		></span>
	</div>
	{#if name}<input type="hidden" {name} value={current} {disabled} />{/if}
</div>
