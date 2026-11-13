<script lang="ts">
	import { Switch as SwitchPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		size = "default",
		appearance = "default",
		...restProps
	}: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
		size?: "sm" | "default";
		appearance?: "default" | "settings";
	} = $props();
</script>

<SwitchPrimitive.Root
	bind:ref
	bind:checked
	data-slot="switch"
	data-size={size}
	data-appearance={appearance}
	class={cn(
		"cn-switch peer group/switch relative inline-flex items-center transition-[background-color,opacity] duration-150 ease-out outline-none after:absolute after:-inset-x-3 after:-inset-y-2 motion-reduce:transition-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
		className
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		data-slot="switch-thumb"
		class={cn(
			"cn-switch-thumb pointer-events-none block shrink-0 ring-0 duration-100 ease-out motion-reduce:transition-none",
			"cn-switch-thumb-motion"
		)}
	/>
</SwitchPrimitive.Root>
