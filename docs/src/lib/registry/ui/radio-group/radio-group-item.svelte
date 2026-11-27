<script lang="ts">
	import { Radio, RadioIndicator } from "@ui-sdk/svelte/radio";
	import { styleToString } from "svelte-toolbelt";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		value,
		disabled,
		style,
		onkeydown,
		...restProps
	}: Omit<HTMLButtonAttributes, "children" | "value" | "style"> & {
		ref?: HTMLButtonElement | null;
		value: string;
		style?: string | Record<string, string | number | null | undefined> | null;
	} = $props();

	const inlineStyle = $derived(style && typeof style === "object" ? styleToString(style) : style);
	const keydown: NonNullable<HTMLButtonAttributes["onkeydown"]> = (event) => {
		onkeydown?.(event);
		const { currentTarget, key } = event;
		const horizontal =
			currentTarget.closest('[data-slot="radio-group"]')?.getAttribute("aria-orientation") ===
			"horizontal";
		// The SDK otherwise handles both arrow axes and submits on Enter.
		if (
			key === "Enter" ||
			(horizontal
				? key === "ArrowUp" || key === "ArrowDown"
				: key === "ArrowLeft" || key === "ArrowRight")
		) {
			event.preventDefault();
		}
	};
</script>

<Radio
	{...restProps}
	{value}
	disabled={disabled ?? undefined}
	onkeydown={keydown}
	style={inlineStyle}
	class={cn(
		"cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
>
	{#snippet render({ props, state })}
		<button
			{...props}
			bind:this={ref}
			disabled={state.disabled}
			data-slot="radio-group-item"
			data-value={value}
			data-state={state.checked ? "checked" : "unchecked"}
		>
			<RadioIndicator keepMounted class="cn-radio-group-indicator" aria-hidden="true">
				{#snippet render({ props: indicator })}
					<span {...indicator} data-slot="radio-group-indicator">
						{#if state.checked}
							<IconPlaceholder
								lucide="CircleIcon"
								tabler="IconCircle"
								hugeicons="CircleIcon"
								phosphor="CircleIcon"
								remixicon="RiCircleLine"
								class="cn-radio-group-indicator-icon"
							/>
						{/if}
					</span>
				{/snippet}
			</RadioIndicator>
		</button>
	{/snippet}
</Radio>
