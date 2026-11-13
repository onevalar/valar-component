<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	export type CommandRootApi = CommandPrimitive.Root;

	let {
		api = $bindable(null),
		ref = $bindable(null),
		value = $bindable(""),
		appearance = "default",
		class: className,
		...restProps
	}: CommandPrimitive.RootProps & {
		api?: CommandRootApi | null;
		appearance?: "default" | "compact";
	} = $props();
</script>

<CommandPrimitive.Root
	bind:this={api}
	bind:value
	bind:ref
	data-slot="command"
	data-command-compact={appearance === "compact" ? "" : undefined}
	class={cn(
		"cn-command flex size-full flex-col overflow-hidden",
		appearance === "compact" && "cn-command-compact",
		className
	)}
	{...restProps}
/>
