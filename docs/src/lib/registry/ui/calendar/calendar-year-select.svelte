<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		class: className,
		value,
		onValueChange,
		...restProps
	}: WithoutChildrenOrChild<CalendarPrimitive.YearSelectProps> & {
		/** Called with the chosen year. */
		onValueChange?: (year: number) => void;
	} = $props();

	const PAGE = 12;
	let open = $state(false);
	// Index of the first year on show; null means "put the current year near the middle".
	let start = $state<number | null>(null);
</script>

<!-- Twelve years at a time with page arrows, not the browser's list of every year there is. -->
<CalendarPrimitive.YearSelect {...restProps}>
	{#snippet child({ yearItems, selectedYearItem })}
		{@const current = value ?? selectedYearItem?.value}
		{@const last = Math.max(0, yearItems.length - PAGE)}
		{@const at = Math.max(
			0,
			yearItems.findIndex((item) => item.value === current)
		)}
		{@const first = Math.min(Math.max(0, start ?? at - 5), last)}
		{@const shown = yearItems.slice(first, first + PAGE)}
		<Popover.Root
			bind:open
			onOpenChange={(next) => {
				if (next) start = null;
			}}
		>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						size="sm"
						aria-label="选择年份"
						class={cn("relative h-(--cell-size) gap-1 ps-2 pe-1.5 font-medium", className)}
					>
						{yearItems.find((item) => item.value === current)?.label ?? current}
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
			<Popover.Content align="start" class="w-60 gap-2 p-2">
				<div class="flex items-center justify-between">
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="前 12 年"
						disabled={first === 0}
						onclick={() => (start = Math.max(0, first - PAGE))}
					>
						<IconPlaceholder
							lucide="ChevronLeftIcon"
							tabler="IconChevronLeft"
							hugeicons="ArrowLeftIcon"
							phosphor="CaretLeftIcon"
							remixicon="RiArrowLeftSLine"
						/>
					</Button>
					<span class="text-sm font-medium">{shown[0]?.label} – {shown.at(-1)?.label}</span>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="后 12 年"
						disabled={first >= last}
						onclick={() => (start = Math.min(last, first + PAGE))}
					>
						<IconPlaceholder
							lucide="ChevronRightIcon"
							tabler="IconChevronRight"
							hugeicons="ArrowRightIcon"
							phosphor="CaretRightIcon"
							remixicon="RiArrowRightSLine"
						/>
					</Button>
				</div>
				<div class="grid grid-cols-3 gap-1">
					{#each shown as item (item.value)}
						<Button
							variant={item.value === current ? "default" : "ghost"}
							size="sm"
							aria-pressed={item.value === current}
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
</CalendarPrimitive.YearSelect>
