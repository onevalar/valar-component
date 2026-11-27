<script lang="ts">
	import { CollapsiblePanel } from "@ui-sdk/svelte/collapsible";
	import { cn, type WithoutChild } from "$lib/utils.js";
	import type { Collapsible as CollapsiblePrimitive } from "bits-ui";
	import { styleToString } from "svelte-toolbelt";

	let {
		ref = $bindable(null),
		class: className,
		style,
		forceMount,
		hiddenUntilFound,
		children,
		...restProps
	}: WithoutChild<CollapsiblePrimitive.ContentProps> = $props();
</script>

<CollapsiblePanel
	keepMounted={forceMount}
	{hiddenUntilFound}
	style={style && typeof style === "object" ? styleToString(style) : style}
	data-slot="trace-collapsible-content"
	class="cn-trace-collapsible-content min-w-0 overflow-hidden [--accordion-panel-height:var(--collapsible-panel-height)] motion-safe:data-open:animate-accordion-down motion-safe:data-closed:animate-accordion-up"
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			bind:this={ref}
			data-slot="trace-collapsible-content"
			hidden={props.hidden === "until-found" ? "until-found" : !forceMount && (props.hidden === "" || props.hidden === true)}
			data-state={state.open ? "open" : "closed"}
		>
			<div
				data-slot="trace-collapsible-content-inner"
				class={cn("cn-trace-collapsible-content-inner min-w-0 wrap-break-word text-muted-foreground", className)}
			>
				{@render children?.()}
			</div>
		</div>
	{/snippet}
</CollapsiblePanel>
