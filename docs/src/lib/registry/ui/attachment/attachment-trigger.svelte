<script lang="ts">
	import { Button as SdkButton } from "@ui-sdk/svelte/button";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		type = "button",
		children,
		onclick,
		child,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const mergedProps = $derived({
		class: cn("cn-attachment-trigger absolute inset-0 z-10 outline-none", className),
		"data-slot": "attachment-trigger",
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: { ...mergedProps, onclick, children } })}
{:else}
	<SdkButton {...mergedProps} disabled={restProps.disabled ?? undefined} type={type ?? undefined} onclick={(event) => onclick?.(event as MouseEvent & { currentTarget: HTMLButtonElement })}>
		{#snippet render({ props })}<button {...props} data-slot="attachment-trigger" bind:this={ref}>{@render children?.()}</button>{/snippet}
	</SdkButton>
{/if}
