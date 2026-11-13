<script lang="ts">
	import { tick } from "svelte";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		open = $bindable(false),
		class: className,
		label,
		trigger,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		open?: boolean;
		label: string;
		/** Receives focus when the panel closes from an interaction inside it. */
		trigger?: HTMLElement | null;
	} = $props();

	async function close() {
		const restoreFocus = ref?.contains(ref.ownerDocument.activeElement);
		open = false;
		if (restoreFocus) {
			await tick();
			if (!open) trigger?.focus({ preventScroll: true });
		}
	}

	// Handle this after nested Bits UI layers have had a chance to dismiss.
	$effect(() => {
		if (!open || !ref) return;
		const section = ref;
		const view = section.ownerDocument.defaultView;
		function handleEscape(event: KeyboardEvent) {
			if (
				event.key !== "Escape" ||
				event.defaultPrevented ||
				event.isComposing ||
				!(event.target instanceof Node) ||
				!section.contains(event.target)
			)
				return;
			event.preventDefault();
			void close();
		}
		view?.addEventListener("keydown", handleEscape);
		return () => view?.removeEventListener("keydown", handleEscape);
	});
</script>

<section
	bind:this={ref}
	aria-label={label}
	data-slot="sheet-panel"
	data-state={open ? "open" : "closed"}
	hidden={!open}
	class={cn("cn-sheet-panel cn-sheet-details data-[state=closed]:hidden", className)}
	{...restProps}
>
	{#if open}
		<div data-slot="sheet-panel-scroll" class="cn-sheet-panel-scroll pe-[11px]">
			{@render children?.()}
		</div>
	{/if}
</section>
