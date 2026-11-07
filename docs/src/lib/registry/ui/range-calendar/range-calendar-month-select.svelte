<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		class: className,
		value,
		onValueChange,
		...restProps
	}: WithoutChildrenOrChild<RangeCalendarPrimitive.MonthSelectProps> & {
		/** Called with the chosen month number (1–12). */
		onValueChange?: (month: number) => void;
	} = $props();

	let open = $state(false);
</script>

<!-- A grid of months in a popover instead of the browser's own list, so the choice is always one short, readable screen. -->
<RangeCalendarPrimitive.MonthSelect {...restProps}>
	{#snippet child({ monthItems, selectedMonthItem })}
		<Popover.Root bind:open>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						size="sm"
						aria-label="选择月份"
						class={cn("relative h-(--cell-size) gap-1 ps-2 pe-1.5 font-medium", className)}
					>
						{monthItems.find((item) => item.value === value)?.label || selectedMonthItem?.label}
						<IconPlaceholder
							lucide="ChevronDownIcon"
							tabler="IconChevronDown"
							hugeicons="ArrowDownIcon"
							phosphor="CaretDownIcon"
							remixicon="RiArrowDownSLine"
							class="size-3.5 text-muted-foreground"
						/>
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content align="start" class="w-52 p-2">
				<div class="grid grid-cols-3 gap-1">
					{#each monthItems as item (item.value)}
						<Button
							variant={item.value === (value ?? selectedMonthItem?.value) ? "default" : "ghost"}
							size="sm"
							aria-pressed={item.value === (value ?? selectedMonthItem?.value)}
							onclick={() => {
								onValueChange?.(item.value);
								open = false;
							}}
						>
							{item.label}
						</Button>
					{/each}
				</div>
			</Popover.Content>
		</Popover.Root>
	{/snippet}
</RangeCalendarPrimitive.MonthSelect>
