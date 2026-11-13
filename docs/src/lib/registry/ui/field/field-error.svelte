<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		errors,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
		errors?: { message?: string }[];
	} = $props();

	const messages = $derived([
		...new Set((errors ?? []).map((error) => error?.message?.trim()).filter(Boolean)),
	]);
</script>

{#if children || messages.length}
	<div
		bind:this={ref}
		role="alert"
		data-slot="field-error"
		class={cn("cn-field-error font-normal", className)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else if messages.length === 1}
			{messages[0]}
		{:else}
			<ul class="ml-4 flex list-disc flex-col gap-1">
				{#each messages as message (message)}
					<li>{message}</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
