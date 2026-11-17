<script lang="ts">
	import { Button, type ButtonProps } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		variant = "ghost",
		size = "xs",
		class: className,
		...restProps
	}: ButtonProps = $props();
</script>

<Button
	bind:ref
	data-slot="trace-action"
	{variant}
	{size}
	class={cn("h-auto min-h-6 max-w-full wrap-anywhere whitespace-normal", className)}
	{...restProps}
/>
