<script lang="ts">
	import { MenuSeparator as SdkSeparator } from "@ui-sdk/svelte/menu";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLElement | null;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkSeparator class={cn("cn-dropdown-menu-separator", className)} {...restProps}>
	{#snippet render({ props })}
		<div {...props} data-slot="dropdown-menu-separator" {...refAttachment}></div>
	{/snippet}
</SdkSeparator>
