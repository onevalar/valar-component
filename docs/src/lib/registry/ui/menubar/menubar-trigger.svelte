<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { getMenubarAppearance } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: MenubarPrimitive.TriggerProps = $props();

	const readAppearance = getMenubarAppearance();
	const appearance = $derived(readAppearance());
</script>

<MenubarPrimitive.Trigger
	bind:ref
	data-slot="menubar-trigger"
	data-appearance={appearance}
	class={cn(
		"flex items-center select-none",
		appearance === "navigation"
			? "min-h-8 max-w-full rounded-full px-3 text-[13px] leading-none font-normal text-foreground/80 outline-none transition-colors duration-100 hover:bg-foreground/5 aria-expanded:bg-foreground/5 focus-visible:outline-1 focus-visible:outline-solid focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:text-[#cacdd1] dark:hover:bg-white/[.047] dark:aria-expanded:bg-white/[.047]"
			: "cn-menubar-trigger outline-hidden",
		className
	)}
	{...restProps}
/>
