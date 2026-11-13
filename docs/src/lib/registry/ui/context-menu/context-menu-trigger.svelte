<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		disabled,
		onkeydown,
		...restProps
	}: ContextMenuPrimitive.TriggerProps = $props();

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		onkeydown?.(event);
		const opensMenu = event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
		if (disabled || event.defaultPrevented || event.target !== event.currentTarget || !opensMenu) {
			return;
		}

		event.preventDefault();
		const target = event.currentTarget;
		const bounds = target.getBoundingClientRect();
		// Bits UI uses the contextmenu event to place the menu at a virtual anchor.
		target.dispatchEvent(
			new MouseEvent("contextmenu", {
				bubbles: true,
				cancelable: true,
				button: 2,
				clientX: bounds.left + Math.min(16, bounds.width / 2),
				clientY: bounds.bottom - Math.min(8, bounds.height / 2),
			})
		);
	}
</script>

<ContextMenuPrimitive.Trigger
	bind:ref
	{disabled}
	data-slot="context-menu-trigger"
	class={cn("cn-context-menu-trigger select-none", className)}
	{...restProps}
	onkeydown={handleKeydown}
/>
