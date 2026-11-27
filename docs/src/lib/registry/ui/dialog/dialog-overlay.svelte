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
	data-slot="dialog-overlay"
	class={cn("cn-dialog-overlay fixed inset-0 isolate z-50", className)}
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			{...refAttachment}
			data-slot="dialog-overlay"
			data-state={state.open ? "open" : "closed"}
		>
			{@render children?.()}
		</div>
	{/snippet}
</SdkBackdrop>
