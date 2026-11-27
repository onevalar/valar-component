<script lang="ts">
	import { DialogDescription as SdkDescription } from "@ui-sdk/svelte/dialog";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLParagraphElement>, "children"> & {
		ref?: HTMLParagraphElement | HTMLElement | null;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLParagraphElement>((el) => {
		ref = el;
	});
</script>

<SdkDescription
	data-slot="sheet-description"
	class={cn("cn-sheet-description", className)}
	{...restProps}
>
	{#snippet render({ props })}
		<p {...props} {...refAttachment} data-slot="sheet-description">{@render children?.()}</p>
	{/snippet}
</SdkDescription>
