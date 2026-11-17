<script lang="ts">
	import { MessageScroller as MessageScrollerPrimitive } from "@valar/svelte-primitives/message-scroller";
	import { prefersReducedMotion } from "svelte/motion";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { ButtonSize, ButtonVariant } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		direction = "end",
		class: className,
		children,
		child: childProp,
		variant = "secondary",
		size = "icon-sm",
		appearance,
		label = appearance === "latest" ? "最新" : direction === "end" ? "滚动到底部" : "滚动到顶部",
		behavior = "smooth",
		onclick,
		...restProps
	}: MessageScrollerPrimitive.ButtonProps & {
		variant?: ButtonVariant;
		size?: ButtonSize;
		/** Screen reader text of the default button. */
		label?: string;
		appearance?: "latest";
	} = $props();
	const latest = $derived(appearance === "latest" && direction === "end");

	function jump(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (!latest || event.defaultPrevented || event.detail !== 0) return;
		const trigger = event.currentTarget;
		const viewport = trigger
			.closest('[data-slot="message-scroller"]')
			?.querySelector<HTMLElement>('[data-slot="message-scroller-viewport"]');
		queueMicrotask(() => {
			if (document.activeElement === document.body) viewport?.focus({ preventScroll: true });
		});
	}
</script>

<MessageScrollerPrimitive.Button
	bind:ref
	data-slot="message-scroller-button"
	data-direction={direction}
	data-variant={variant}
	data-size={size}
	data-appearance={appearance}
	{direction}
	behavior={prefersReducedMotion.current ? "instant" : behavior}
	onclick={jump}
	class={cn(
		"cn-message-scroller-button absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
		latest &&
			"cn-message-scroller-button-latest h-7 w-auto rounded-full border-[0.5px] ps-2 pe-2.5 data-[direction=end]:bottom-3 motion-reduce:transition-none [&_svg]:size-3.5",
		className
	)}
	{...restProps}
>
	{#snippet child(state)}
		{#if childProp}
			{@render childProp(state)}
		{:else}
			<Button {variant} {size} {...state.props}>
				{#if children}
					{@render children()}
				{:else}
					<IconPlaceholder
						lucide="ArrowDownIcon"
						tabler="IconArrowDown"
						hugeicons="ArrowDown02Icon"
						phosphor="ArrowDownIcon"
						remixicon="RiArrowDownLine"
					/>
					<span class={latest ? undefined : "sr-only"}>
						{label}
					</span>
				{/if}
			</Button>
		{/if}
	{/snippet}
</MessageScrollerPrimitive.Button>
