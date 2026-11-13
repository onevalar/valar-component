<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		showCloseButton = false,
		closeLabel = "关闭",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		showCloseButton?: boolean;
		closeLabel?: string;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="dialog-footer"
	class={cn("cn-dialog-footer flex flex-wrap justify-end gap-2", className)}
	{...restProps}
>
	{@render children?.()}
	{#if showCloseButton}
		<DialogPrimitive.Close>
			{#snippet child({ props })}
				<Button variant="outline" shape="pill" {...props}>{closeLabel}</Button>
			{/snippet}
		</DialogPrimitive.Close>
	{/if}
</div>
