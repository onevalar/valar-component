<svelte:options css="injected" />

<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes, SVGAttributes } from "svelte/elements";

	type IconProps = SVGAttributes<SVGSVGElement> & { appearance?: "icon" };
	type DotsProps = HTMLAttributes<HTMLSpanElement> & { appearance: "dots"; label?: string };
	let props: IconProps | DotsProps = $props();
	// Keep caller-owned dimensions out of default-size previews, including size-4 itself.
	const explicitSize = $derived(/(?:^|\s)(?:\S+:)?!?(?:size|w|h)-/.test(cn(props.class)));
</script>

{#if props.appearance === "dots"}
	{@const { appearance, label = "加载中", role = "status", class: className, ...restProps } = props}
	<span
		data-slot="spinner"
		data-appearance={appearance}
		{role}
		class={cn(
			"inline-flex h-6 min-w-0 max-w-full items-center text-xs font-medium text-[lch(9.444%_0_282)] dark:text-[lch(100%_0_272)]",
			className
		)}
		{...restProps}
	>
		<span class="inline-flex min-w-0 items-baseline">
			<span class="truncate" data-slot="spinner-label">{label}</span>
			<span aria-hidden="true" class="inline-flex shrink-0 font-mono text-[8px]/none" dir="ltr">
				<span data-slot="spinner-dot">.</span><span data-slot="spinner-dot">.</span><span data-slot="spinner-dot">.</span>
			</span>
		</span>
	</span>
{:else}
	{@const {
		appearance,
		class: className,
		role = "status",
		name,
		color,
		stroke,
		className: legacyClassName,
		"aria-label": ariaLabel = "加载中",
		...restProps
	} = props}
	<IconPlaceholder
		lucide="Loader2Icon"
		tabler="IconLoader"
		hugeicons="Loading03Icon"
		phosphor="SpinnerIcon"
		remixicon="RiLoaderLine"
		data-slot="spinner"
		data-appearance={appearance ?? "icon"}
		{role}
		{...name != null ? { name } : {}}
		{...color != null ? { color } : {}}
		{...stroke != null ? { stroke } : {}}
		{...legacyClassName != null ? { className: legacyClassName } : {}}
		aria-label={ariaLabel}
		class={cn("size-4 shrink-0 motion-safe:animate-spin", "cn-spinner", className)}
		{...restProps}
		data-spinner-size-explicit={explicitSize ? "" : undefined}
	/>
{/if}

<style>
	[data-slot="spinner-dot"] {
		width: 4.8px;
		text-align: center;
	}

	@media (prefers-reduced-motion: no-preference) {
		[data-slot="spinner-dot"] {
			opacity: 0.3;
			animation: spinner-dot 1s ease-in-out infinite;
		}

		[data-slot="spinner-dot"]:nth-child(2) {
			animation-delay: 166ms;
		}

		[data-slot="spinner-dot"]:nth-child(3) {
			animation-delay: 332ms;
		}
	}

	@keyframes spinner-dot {
		0%, 37%, 100% { opacity: 0.3; }
		17% { opacity: 1; }
	}
</style>
