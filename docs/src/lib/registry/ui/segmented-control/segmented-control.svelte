<script lang="ts" module>
	import type { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	export type Segment = { value: string; label: string; accessory?: Snippet; disabled?: boolean };
	export type SegmentedControlProps = Omit<
		ToggleGroupPrimitive.RootProps,
		"type" | "value" | "onValueChange" | "children" | "child"
	> & {
		options: Segment[];
		value?: string;
		label: string;
		disabled?: boolean;
		onValueChange?: (value: string) => void;
		onOptionIntent?: (value: string) => void;
	};
</script>

<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from "$lib/registry/ui/toggle-group/index.js";
	import { cn } from "$lib/utils.js";
	let {
		options,
		value = $bindable(""),
		label,
		disabled = false,
		onValueChange,
		onOptionIntent,
		class: className,
		...rest
	}: SegmentedControlProps = $props();
	function select(next: string) {
		if (!next || disabled || next === value) return;
		value = next;
		onValueChange?.(next);
	}
	function key(event: KeyboardEvent, current: string) {
		if (["Enter", " "].includes(event.key) && current === value) {
			event.preventDefault();
			return;
		}
		const items = options.filter((option) => !option.disabled);
		const index = items.findIndex((option) => option.value === current);
		const rtl = getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
		const move =
			event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")
				? 1
				: event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft")
					? -1
					: 0;
		const target =
			event.key === "Home"
				? 0
				: event.key === "End"
					? items.length - 1
					: move
						? (index + move + items.length) % items.length
						: -1;
		if (target < 0 || !items[target] || disabled) return;
		event.preventDefault();
		select(items[target].value);
		const group = (event.currentTarget as HTMLElement).closest('[data-slot="segmented-control"]');
		const button = Array.from(group?.querySelectorAll<HTMLButtonElement>("button") ?? []).find(
			(button) => button.dataset.value === items[target].value
		);
		button?.focus({ preventScroll: true });
		button?.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "instant" });
	}
</script>

<ToggleGroup
	type="single"
	{value}
	{disabled}
	onValueChange={select}
	aria-label={label}
	class={cn("max-w-full overflow-x-auto rounded-lg bg-muted p-1", className)}
	{...rest}
	data-slot="segmented-control"
>
	{#each options as option (option.value)}
		<ToggleGroupItem
			value={option.value}
			disabled={option.disabled}
			data-value={option.value}
			tabindex={value === option.value || (!value && options[0] === option) ? 0 : -1}
			class="shrink-0 rounded-md px-3 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
			onclick={(event) => {
				if (value === option.value) event.preventDefault();
			}}
			onkeydown={(event) => key(event, option.value)}
			onpointerenter={() => {
				if (!disabled && !option.disabled) onOptionIntent?.(option.value);
			}}
			onfocus={() => onOptionIntent?.(option.value)}
		>
			{option.label}{@render option.accessory?.()}
		</ToggleGroupItem>
	{/each}
</ToggleGroup>
