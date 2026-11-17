<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	export type SliderFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		/** Visible label for the slider and the editable number input, when present. */
		label: string;
		/** The settings row uses a read-only numeric display instead of a number input. */
		appearance?: "default" | "readout";
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		/** Shown after the number, e.g. "px". Not part of the value. */
		unit?: string;
		disabled?: boolean;
		/** Form field name. The value is submitted as a plain number. */
		name?: string;
		onValueChange?: (value: number) => void;
	};
</script>

<script lang="ts">
	import { NumberField } from "$lib/registry/ui/number-field/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";
	import { cn } from "$lib/utils.js";

	let {
		label,
		appearance = "default",
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		unit,
		disabled = false,
		name,
		onValueChange,
		id: idProp,
		class: className,
		...restProps
	}: SliderFieldProps = $props();
	const generated = $props.id();
	const id = $derived(idProp ?? generated);

	function set(next: number | undefined) {
		// An emptied or invalid number box keeps the last value instead of becoming 0.
		// Out-of-range typing is shown as invalid by the number box until it is corrected.
		if (next === undefined || !Number.isFinite(next) || next < min || next > max) return;
		if (Object.is(next, value)) return;
		value = next;
		onValueChange?.(next);
	}
</script>

{#snippet slider(settings: boolean)}
	<Slider
		type="single"
		appearance={settings ? "settings" : "default"}
		{value}
		onValueChange={set}
		{min}
		{max}
		{step}
		{disabled}
		aria-label={settings ? undefined : label}
		aria-labelledby={settings ? `${id}-label` : undefined}
		aria-valuetext={settings && unit ? `${value} ${unit}` : undefined}
	/>
{/snippet}

{#if appearance === "default"}
	<div
		data-slot="slider-field"
		data-appearance="default"
		data-disabled={disabled || undefined}
		class={cn(
			"grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2",
			"cn-slider-field",
			className
		)}
		{...restProps}
	>
		<label for={`${id}-input`} class="col-span-2 text-sm font-medium">{label}</label>
		{@render slider(false)}
		<div class="flex items-center gap-1.5">
			<NumberField
				id={`${id}-input`}
				{name}
				{value}
				onValueChange={set}
				{min}
				{max}
				{step}
				{disabled}
				class={cn("w-32", "cn-slider-field-value")}
				decrementLabel={`减小${label}`}
				incrementLabel={`增大${label}`}
			/>
			{#if unit}<span class="text-xs text-muted-foreground">{unit}</span>{/if}
		</div>
	</div>
{:else}
	<div
		data-slot="slider-field"
		data-appearance="readout"
		data-disabled={disabled || undefined}
		class={cn(
			"flex min-h-16 w-full max-w-[640px] min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2",
			className
		)}
		{...restProps}
	>
		<span
			id={`${id}-label`}
			class="min-w-0 [overflow-wrap:anywhere] text-[13px]/[15.5px] font-[450] text-[#5e5e5f] dark:text-[#9a9c9a]"
		>
			{label}
		</span>
		<div
			data-slot="slider-field-control"
			class="flex h-8 w-[250px] max-w-full min-w-0 items-center gap-2"
		>
			{@render slider(true)}
			<span
				data-slot="slider-field-readout"
				class="shrink-0 ps-1 text-end text-[13px]/[15.5px] font-medium text-[#303031] tabular-nums dark:text-[#e4e5e3]"
			>
				{value}{unit}
			</span>
		</div>
		{#if name}<input type="hidden" {name} {value} {disabled} />{/if}
	</div>
{/if}
