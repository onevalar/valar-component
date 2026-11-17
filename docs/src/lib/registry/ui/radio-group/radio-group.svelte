<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		value = $bindable(""),
		...restProps
	}: RadioGroupPrimitive.RootProps & { appearance?: "default" | "settings" } = $props();
</script>

<RadioGroupPrimitive.Root
	bind:ref
	bind:value
	data-slot="radio-group"
	data-appearance={appearance}
	class={cn("cn-radio-group w-full min-w-0", appearance === "settings" && "gap-4", className)}
	{...restProps}
/>
