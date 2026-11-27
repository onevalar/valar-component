<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & { ref?: HTMLDivElement | null } = $props();
</script>

<div
	bind:this={ref}
	data-slot="select-scroll-up-button"
	aria-hidden="true"
	class={cn("cn-select-scroll-up-button hidden", className)}
	{...restProps}
>
	<IconPlaceholder
		lucide="ChevronUpIcon"
		tabler="IconChevronUp"
		hugeicons="ArrowUp01Icon"
		phosphor="CaretUpIcon"
		remixicon="RiArrowUpSLine"
	/>
</div>
