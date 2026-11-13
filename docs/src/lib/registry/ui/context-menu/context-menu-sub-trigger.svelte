<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn, type WithoutChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		"aria-haspopup": popupRole = "menu",
		children,
		...restProps
	}: WithoutChild<ContextMenuPrimitive.SubTriggerProps> & {
		inset?: boolean;
	} = $props();
</script>

<ContextMenuPrimitive.SubTrigger
	bind:ref
	data-slot="context-menu-sub-trigger"
	data-inset={inset}
	class={cn(
		"cn-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{#snippet child({ props })}
		<div {...props} aria-haspopup={popupRole}>
			{@render children?.()}
			<IconPlaceholder
				lucide="ChevronRightIcon"
				tabler="IconChevronRight"
				hugeicons="ArrowRight01Icon"
				phosphor="CaretRightIcon"
				remixicon="RiArrowRightSLine"
				class="cn-rtl-flip ms-auto rtl:rotate-180"
			/>
		</div>
	{/snippet}
</ContextMenuPrimitive.SubTrigger>
