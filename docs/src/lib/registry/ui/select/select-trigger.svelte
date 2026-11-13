<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn, type WithoutChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = "default",
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: "sm" | "default" | "settings";
	} = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		"cn-select-trigger flex w-fit max-w-full min-w-0 items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:overflow-hidden [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<IconPlaceholder
		lucide="ChevronDownIcon"
		tabler="IconSelector"
		hugeicons="UnfoldMoreIcon"
		phosphor="CaretDownIcon"
		remixicon="RiArrowDownSLine"
		class="cn-select-trigger-icon pointer-events-none"
	/>
</SelectPrimitive.Trigger>
