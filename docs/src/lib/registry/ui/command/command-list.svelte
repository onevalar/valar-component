<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		child,
		children,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
	bind:ref
	data-slot="command-list"
	class={cn("cn-command-list overflow-x-hidden overflow-y-auto", className)}
	{child}
	{...restProps}
>
	<CommandPrimitive.Viewport>
		{@render children?.()}
	</CommandPrimitive.Viewport>
</CommandPrimitive.List>
