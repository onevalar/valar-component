<script lang="ts">
	import { DialogBackdrop as SdkBackdrop } from "@ui-sdk/svelte/dialog";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		ref?: HTMLDivElement | HTMLElement | null;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
	});
</script>

<SdkBackdrop
	data-slot="sheet-overlay"
	class={cn(
		"cn-sheet-overlay fixed inset-0 z-50 duration-100 motion-reduce:animate-none! data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
		className
	)}
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			{...refAttachment}
			data-slot="sheet-overlay"
			data-state={state.open ? "open" : "closed"}
		>
			{@render children?.()}
		</div>
	{/snippet}
</SdkBackdrop>
