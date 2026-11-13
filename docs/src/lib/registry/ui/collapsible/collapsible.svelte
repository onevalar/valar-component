<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		open = $bindable(false),
		appearance = "default",
		class: className,
		...restProps
	}: CollapsiblePrimitive.RootProps & {
		appearance?: "default" | "properties";
	} = $props();
</script>

<CollapsiblePrimitive.Root
	bind:ref
	bind:open
	data-slot="collapsible"
	data-appearance={appearance}
	class={cn(appearance === "properties" && "cn-collapsible-properties", className)}
	{...restProps}
/>
