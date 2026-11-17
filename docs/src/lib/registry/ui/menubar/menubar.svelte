<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { setMenubarAppearance, type MenubarAppearance } from "./context.js";

	let {
		ref = $bindable(null),
		appearance = "default",
		class: className,
		...restProps
	}: MenubarPrimitive.RootProps & { appearance?: MenubarAppearance } = $props();

	setMenubarAppearance(() => appearance);
</script>

<MenubarPrimitive.Root
	bind:ref
	data-slot="menubar"
	data-appearance={appearance}
	class={cn(
		"flex items-center",
		appearance === "navigation" ? "min-w-0 flex-wrap gap-1" : "cn-menubar",
		className
	)}
	{...restProps}
/>
