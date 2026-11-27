<script lang="ts">
	import {
		buttonVariants,
		type ButtonVariant,
		type ButtonSize,
	} from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		type = "button",
		variant = "default",
		size = "default",
		loading = false,
		onclick,
		children,
		child,
		...restProps
	}: Omit<HTMLButtonAttributes, "children"> & {
		ref?: HTMLButtonElement | HTMLElement | null;
		variant?: ButtonVariant;
		size?: ButtonSize;
		/** Blocks repeat activation and retains keyboard focus while an action is pending. */
		loading?: boolean;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	function handleClick(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (loading || restProps["aria-disabled"] === true || restProps["aria-disabled"] === "true") {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		onclick?.(event);
	}
</script>

{#if child}
	{@render child({
		props: {
			...restProps,
			type,
			"data-slot": "alert-dialog-action",
			"data-variant": variant,
			"data-loading": loading ? "" : undefined,
			"aria-busy": loading ? true : restProps["aria-busy"],
			"aria-disabled": loading ? true : restProps["aria-disabled"],
			class: cn(
				buttonVariants({ variant, size, shape: "pill" }),
				"cn-alert-dialog-action",
				className
			),
			onclick: handleClick,
		},
	})}
{:else}
	<button
		bind:this={ref}
		{type}
		data-slot="alert-dialog-action"
		data-variant={variant}
		class={cn(buttonVariants({ variant, size, shape: "pill" }), "cn-alert-dialog-action", className)}
		{...restProps}
		aria-busy={loading ? true : restProps["aria-busy"]}
		aria-disabled={loading ? true : restProps["aria-disabled"]}
		data-loading={loading ? "" : undefined}
		onclick={handleClick}
	>
		{@render children?.()}
	</button>
{/if}
