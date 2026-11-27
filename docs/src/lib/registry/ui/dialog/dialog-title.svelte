<script lang="ts">
	import { DialogTitle as SdkTitle } from "@ui-sdk/svelte/dialog";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
		ref?: HTMLHeadingElement | HTMLElement | null;
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLHeadingElement>((el) => {
		ref = el;
	});
</script>

<SdkTitle
	data-slot="dialog-title"
	class={cn("cn-font-heading cn-dialog-title", className)}
	{...restProps}
>
	{#snippet render({ props })}
		<h2 {...props} {...refAttachment}>{@render children?.()}</h2>
	{/snippet}
</SdkTitle>
