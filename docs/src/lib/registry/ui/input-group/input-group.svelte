<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		children,
		...props
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		appearance?: "default" | "settings-search" | "settings-name";
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-group"
	data-appearance={appearance}
	role="group"
	class={cn(
		"group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
		appearance === "settings-search" && "cn-input-group-settings-search",
		appearance === "settings-name" && "cn-input-group-settings-name",
		className
	)}
	{...props}
>
	{@render children?.()}
</div>
