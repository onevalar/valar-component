<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		min = 0,
		max = 100,
		value = 0,
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> & {
		appearance?: "default" | "project";
	} = $props();

	const projectClass = $derived(appearance === "project" && "cn-progress-project");
	const currentValue = $derived(value === null ? null : Math.min(max, Math.max(min, value)));
	const fraction = $derived(currentValue !== null && max > min ? (currentValue - min) / (max - min) : 0);
</script>

<ProgressPrimitive.Root
	bind:ref
	data-slot="progress"
	data-appearance={appearance === "project" ? "project" : undefined}
	class={cn(
		"cn-progress relative flex w-full items-center overflow-x-hidden",
		projectClass,
		className
	)}
	value={currentValue}
	{min}
	{max}
	{...restProps}
>
	{#if appearance === "project"}
		<span aria-hidden="true">{currentValue === null ? "—" : `${Math.round(fraction * 100)}%`}</span>
	{:else}
		<div
			data-slot="progress-indicator"
			data-indeterminate={currentValue === null ? "" : undefined}
			class="cn-progress-indicator h-full shrink-0 rounded-[inherit] transition-[width] duration-150 data-indeterminate:mx-auto motion-safe:data-indeterminate:animate-pulse motion-reduce:transition-none"
			style:width={currentValue === null ? "35%" : `${fraction * 100}%`}
		></div>
	{/if}
</ProgressPrimitive.Root>
