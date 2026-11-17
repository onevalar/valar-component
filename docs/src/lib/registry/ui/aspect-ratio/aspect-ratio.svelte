<script lang="ts">
	import { AspectRatio as AspectRatioPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		ratio = 1,
		appearance = "default",
		mediaWidth,
		...restProps
	}: AspectRatioPrimitive.RootProps & {
		appearance?: "default" | "media";
		/** Preferred display width in pixels. The container and media height limit can reduce it. */
		mediaWidth?: number;
	} = $props();

	const media = $derived(appearance === "media");
	const mediaRatio = $derived(Number.isFinite(ratio) && ratio > 0 ? ratio : 1);
	const maxMediaWidth = $derived(
		Math.min(
			mediaWidth !== undefined && Number.isFinite(mediaWidth) && mediaWidth > 0
				? mediaWidth
				: Infinity,
			600 * mediaRatio
		)
	);
</script>

{#snippet frame()}
	<AspectRatioPrimitive.Root
		bind:ref
		ratio={media ? mediaRatio : ratio}
		data-slot="aspect-ratio"
		data-appearance={media ? "media" : undefined}
		class={cn("cn-aspect-ratio-geometry", className)}
		{...restProps}
	/>
{/snippet}

{#if media}
	<div
		class="w-full min-w-0 [&_[data-slot=aspect-ratio]]:overflow-hidden [&_[data-slot=aspect-ratio]]:rounded-[6px] [&_:is(img,video)]:size-full [&_:is(img,video)]:object-contain"
		style:max-width={`${maxMediaWidth}px`}
	>
		{@render frame()}
	</div>
{:else}
	{@render frame()}
{/if}
