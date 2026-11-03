<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import type { SVGAttributes } from "svelte/elements";

	let {
		class: className,
		role = "status",
		// we add name, color, and stroke for compatibility with different icon libraries props.
		// only forward them when set, otherwise `stroke: undefined` overrides the icon's `currentColor`
		name,
		color,
		stroke,
		className: legacyClassName,
		"aria-label": ariaLabel = "加载中",
		...restProps
	}: SVGAttributes<SVGSVGElement> = $props();
	// Keep caller-owned dimensions out of default-size previews, including size-4 itself.
	const explicitSize = $derived(/(?:^|\s)(?:\S+:)?!?(?:size|w|h)-/.test(cn(className)));
</script>

<IconPlaceholder
	lucide="Loader2Icon"
	tabler="IconLoader"
	hugeicons="Loading03Icon"
	phosphor="SpinnerIcon"
	remixicon="RiLoaderLine"
	data-slot="spinner"
	{role}
	{...name != null ? { name } : {}}
	{...color != null ? { color } : {}}
	{...stroke != null ? { stroke } : {}}
	{...legacyClassName != null ? { className: legacyClassName } : {}}
	aria-label={ariaLabel}
	class={cn("size-4 animate-spin", "cn-spinner", className)}
	{...restProps}
	data-spinner-size-explicit={explicitSize ? "" : undefined}
/>
