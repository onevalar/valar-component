<script lang="ts">
	import { AccordionHeader, AccordionTrigger } from "@ui-sdk/svelte/accordion";
	import { styleToString, type StyleProperties } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import { getAccordionOrientation } from "./context.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		level = 3,
		disabled,
		style,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes, "style"> & {
		ref?: HTMLElement | null;
		style?: StyleProperties | string | null;
		level?: 1 | 2 | 3 | 4 | 5 | 6;
	} = $props();

	const orientation = getAccordionOrientation();
	const refKey = createAttachmentKey();
	function setRef(element: HTMLElement) {
		ref = element;
		return () => {
			ref = null;
		};
	}
</script>

<AccordionHeader
	class="flex"
	data-accordion-header=""
	data-heading-level={level}
	data-orientation={orientation()}
>
	{#snippet render({ props, state })}
		<svelte:element this={`h${level}`} {...props} data-state={state.open ? "open" : "closed"}>
			{@render trigger()}
		</svelte:element>
	{/snippet}
</AccordionHeader>

{#snippet trigger()}
	<AccordionTrigger
		data-slot="accordion-trigger"
		data-accordion-trigger=""
		data-orientation={orientation()}
		disabled={disabled ?? undefined}
		class={cn(
			"cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
			className
		)}
		style={style && typeof style === "object" ? styleToString(style) : style}
		{...restProps}
	>
		{#snippet render({ props, state })}
			{@const attributes = { ...props, [refKey]: setRef }}
			<button {...attributes} disabled={state.disabled} data-state={state.open ? "open" : "closed"}>
				{@render children?.()}
				{@render icons()}
			</button>
		{/snippet}
	</AccordionTrigger>
{/snippet}

{#snippet icons()}
	<IconPlaceholder
		lucide="ChevronDownIcon"
		tabler="IconChevronDown"
		data-slot="accordion-trigger-icon"
		hugeicons="ArrowDown01Icon"
		phosphor="CaretDownIcon"
		remixicon="RiArrowDownSLine"
		class="cn-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
	/>
	<IconPlaceholder
		lucide="ChevronUpIcon"
		tabler="IconChevronUp"
		data-slot="accordion-trigger-icon"
		hugeicons="ArrowUp01Icon"
		phosphor="CaretUpIcon"
		remixicon="RiArrowUpSLine"
		class="cn-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
	/>
{/snippet}
