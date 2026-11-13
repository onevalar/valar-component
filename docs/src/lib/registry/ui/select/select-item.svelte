<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn, type WithoutChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		disabled = false,
		children: childrenProp,
		...restProps
	}: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	{value}
	{label}
	{disabled}
	aria-disabled={disabled || undefined}
	data-slot="select-item"
	class={cn(
		"cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{#snippet children({ selected, highlighted })}
		<span class="cn-select-item-indicator" aria-hidden="true">
			{#if selected}
				<IconPlaceholder
					lucide="CheckIcon"
					tabler="IconCheck"
					hugeicons="Tick02Icon"
					phosphor="CheckIcon"
					remixicon="RiCheckLine"
					class="cn-select-item-indicator-icon pointer-events-none"
				/>
			{/if}
		</span>
		<!-- parity-ignore: Bits renders the item text inline, so it needs its own box; Radix ItemText carries no classes -->
		<span class="cn-select-item-text min-w-0">
			{#if childrenProp}
				{@render childrenProp({ selected, highlighted })}
			{:else}
				<span class="truncate">{label || value}</span>
			{/if}
		</span>
	{/snippet}
</SelectPrimitive.Item>
