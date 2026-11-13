<script lang="ts">
	import { Label as LabelPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		required = false,
		children,
		...restProps
	}: LabelPrimitive.RootProps & {
		appearance?: "default" | "settings";
		required?: boolean;
	} = $props();
</script>

<LabelPrimitive.Root
	bind:ref
	data-slot="label"
	data-appearance={appearance}
	class={cn(
		"cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
		"cn-label-layout",
		appearance === "settings" && "cn-label-appearance-settings",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	{#if required}
		<span data-slot="label-required" aria-hidden="true" class="text-destructive">*</span>
	{/if}
</LabelPrimitive.Root>
