<script lang="ts">
	import { AccordionPanel } from "@ui-sdk/svelte/accordion";
	import { styleToString, type StyleProperties } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import { getAccordionOrientation } from "./context.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		style,
		forceMount = false,
		hiddenUntilFound = false,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
		ref?: HTMLElement | null;
		style?: StyleProperties | string | null;
		forceMount?: boolean;
		hiddenUntilFound?: boolean;
	} = $props();

	const orientation = getAccordionOrientation();
	const refKey = createAttachmentKey();
	function setRef(element: HTMLElement) {
		ref = element;
		return () => {
			ref = null;
		};
	}

	const panelStyle = $derived(
		styleToString({
			"--bits-accordion-content-height": "var(--accordion-panel-height)",
			"--bits-accordion-content-width": "var(--accordion-panel-width)",
			...(typeof style === "object" ? style : {}),
		}) + (typeof style === "string" ? `;${style}` : "")
	);
</script>

<AccordionPanel
	keepMounted
	{hiddenUntilFound}
	data-slot="accordion-content"
	data-accordion-content=""
	data-orientation={orientation()}
	class="cn-accordion-content overflow-hidden motion-reduce:animate-none!"
	style={panelStyle}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = { ...props, [refKey]: setRef }}
		<div
			{...attributes}
			data-slot="accordion-content"
			data-state={state.open ? "open" : "closed"}
			hidden={forceMount && !hiddenUntilFound
				? undefined
				: props.hidden === ""
					? true
					: (props.hidden as boolean | "until-found" | undefined)}
		>
			<div
				class={cn(
					"cn-accordion-content-inner [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
					className
				)}
			>
				{@render children?.()}
			</div>
		</div>
	{/snippet}
</AccordionPanel>
