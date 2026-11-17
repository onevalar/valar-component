<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { setAccordionAppearance, type AccordionAppearance } from "./accordion-context.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		appearance = "default",
		class: className,
		...restProps
	}: AccordionPrimitive.RootProps & { appearance?: AccordionAppearance } = $props();

	setAccordionAppearance(() => appearance);
</script>

<AccordionPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="accordion"
	data-appearance={appearance}
	class={cn("cn-accordion flex w-full flex-col", className)}
	{...restProps}
/>
