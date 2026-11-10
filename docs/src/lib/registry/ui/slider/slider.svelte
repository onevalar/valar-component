<script lang="ts">
	import { Slider as SliderPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		orientation = "horizontal",
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		"aria-valuetext": ariaValueText,
		thumbLabels,
		largeStep,
		class: className,
		...restProps
	}: WithoutChildrenOrChild<SliderPrimitive.RootProps> & {
		thumbLabels?: string[];
		/** Opt in to custom scalar keyboard navigation with this Page/Shift step. */
		largeStep?: number;
	} = $props();

	function keyboard(event: KeyboardEvent, fallback: unknown) {
		// Leave app/browser shortcuts untouched, including their defaultPrevented state.
		if (largeStep === undefined || restProps.type !== "single" || Array.isArray(restProps.step)) {
			if (typeof fallback === "function") fallback(event);
			return;
		}
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
		if (restProps.disabled || typeof value !== "number") return;
		const min = restProps.min ?? 0,
			max = restProps.max ?? 100,
			step = restProps.step ?? 1;
		const large = largeStep;
		const delta = ["ArrowRight", "ArrowUp"].includes(event.key)
			? event.shiftKey
				? large
				: step
			: ["ArrowLeft", "ArrowDown"].includes(event.key)
				? -(event.shiftKey ? large : step)
				: event.key === "PageUp"
					? large
					: event.key === "PageDown"
						? -large
						: undefined;
		const wanted =
			event.key === "Home"
				? min
				: event.key === "End"
					? max
					: delta === undefined
						? undefined
						: value + delta;
		if (wanted === undefined) return;
		event.preventDefault();
		const next =
			event.key === "Home"
				? min
				: event.key === "End"
					? max
					: Math.min(
							max,
							Math.max(min, Number((min + Math.round((wanted - min) / step) * step).toFixed(10)))
						);
		if (Object.is(next, value)) return;
		value = next;
		restProps.onValueChange?.(next);
		restProps.onValueCommit?.(next);
	}
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="slider"
	{orientation}
	class={cn(
		"cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col",
		className
	)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span
			data-slot="slider-track"
			data-orientation={orientation}
			class={cn(
				"cn-slider-track relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full"
			)}
		>
			<SliderPrimitive.Range
				data-slot="slider-range"
				class={cn(
					"cn-slider-range absolute select-none data-horizontal:h-full data-vertical:w-full"
				)}
			/>
		</span>
		{#each thumbItems as thumb (thumb.index)}
			<SliderPrimitive.Thumb
				data-slot="slider-thumb"
				index={thumb.index}
				aria-label={thumbLabels?.[thumb.index] ?? ariaLabel}
				aria-labelledby={ariaLabelledby}
				aria-valuetext={ariaValueText}
				class="cn-slider-thumb block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"
			>
				{#snippet child({ props })}
					<span {...props} onkeydown={(event) => keyboard(event, props.onkeydown)}></span>
				{/snippet}
			</SliderPrimitive.Thumb>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
