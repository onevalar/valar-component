<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { getAccordionAppearance } from "./accordion-context.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AccordionPrimitive.ItemProps = $props();

	const appearance = getAccordionAppearance();
</script>

<AccordionPrimitive.Item
	bind:ref
	data-slot="accordion-item"
	data-appearance={appearance()}
	class={cn("cn-accordion-item", className)}
	{...restProps}
/>
