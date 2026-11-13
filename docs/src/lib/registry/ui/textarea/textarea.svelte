<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils.js";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		appearance = "default",
		"data-slot": dataSlot = "textarea",
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> & {
		appearance?: "default" | "settings";
	} = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	data-appearance={appearance}
	class={cn(
		"cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
		appearance === "settings" && "cn-textarea-appearance-settings",
		className
	)}
	bind:value
	{...restProps}></textarea>
