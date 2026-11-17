<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn, type WithoutChild } from "$lib/utils.js";
	import { getAccordionAppearance } from "./accordion-context.js";

	let {
		ref = $bindable(null),
		class: className,
		level = 3,
		children,
		...restProps
	}: WithoutChild<AccordionPrimitive.TriggerProps> & {
		level?: AccordionPrimitive.HeaderProps["level"];
	} = $props();

	const appearance = getAccordionAppearance();
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		data-slot="accordion-trigger"
		data-appearance={appearance()}
		bind:ref
		class={cn(
			"cn-accordion-trigger group/accordion-trigger relative flex min-w-0 flex-1 items-start justify-between gap-2 border border-transparent wrap-anywhere transition-colors outline-none disabled:pointer-events-none disabled:opacity-50",
			className
		)}
		{...restProps}
	>
		{#if appearance() === "section"}
			<span
				data-slot="accordion-section-indicator"
				class="cn-accordion-section-indicator pointer-events-none shrink-0"
				aria-hidden="true"
			>
				<span data-slot="accordion-section-icon" class="cn-accordion-section-icon"></span>
			</span>
		{/if}
		{@render children?.()}
		{#if appearance() === "default"}
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
		{/if}
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
