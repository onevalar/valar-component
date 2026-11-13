<script lang="ts">
	import type { WithElementRef } from "$lib/utils.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		appearance = "default",
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		appearance?: "default" | "workspace";
	} = $props();
</script>

<nav
	bind:this={ref}
	data-slot="breadcrumb"
	data-appearance={appearance}
	aria-label="面包屑导航"
	class={cn("cn-breadcrumb", appearance === "workspace" && "cn-breadcrumb-workspace", className)}
	{...restProps}
>
	{@render children?.()}
</nav>
