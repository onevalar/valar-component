<script lang="ts">
	import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Calendar } from "$lib/registry/ui/calendar/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { cn } from "$lib/utils.js";
	import {
		dateLabel,
		grains,
		inferTimeframe,
		timeframeEnd,
		type Grain,
		type Timeframe,
	} from "./date-value.js";
	import type { ComponentProps } from "svelte";

	let {
		label,
		placeholder = label,
		value = $bindable(),
		min,
		max,
		locale = "en",
		precisions = grains,
		allowClear = true,
		portalProps,
		class: className,
		onValueChange,
	}: {
		label: string;
		placeholder?: string;
		value?: Timeframe;
		min?: Timeframe;
		max?: Timeframe;
		locale?: string;
		precisions?: readonly Grain[];
		allowClear?: boolean;
		portalProps?: ComponentProps<typeof Popover.Content>["portalProps"];
		class?: string;
		onValueChange?: (value: Timeframe | undefined) => void;
	} = $props();

	const valueId = $props.id();
	const chinese = $derived(locale.toLowerCase().startsWith("zh"));
	const available = $derived(precisions.length ? precisions : grains);

	const labels: Record<Grain, [string, string]> = {
		day: ["日", "Day"],
		month: ["月", "Month"],
		quarter: ["季度", "Quarter"],
		half: ["半年", "Half-year"],
		year: ["年", "Year"],
	};
	const examples: Record<Grain, string> = {
		day: "YYYY-MM-DD",
		month: "YYYY-MM",
		quarter: "Q2 2027",
		half: "H1 2027",
		year: "2027",
	};
	let open = $state(false);
	let grain = $state<Grain>("day");
	let year = $state(0);
	let typed = $state("");
	let error = $state("");
	let input = $state<HTMLInputElement | null>(null);
	const prompt = $derived(
		available.length === 1
			? examples[available[0]]
			: chinese
				? "试试 2027-05、Q4 或 2027-05-20"
				: "Try: May 2027, Q4, 05/20/2027"
	);
	const minDate = $derived(min ? parseDate(min.date) : undefined);
	const maxDate = $derived(max ? timeframeEnd(max) : undefined);
	const years = $derived([year, year + 1, year + 2].filter((item) => item <= 9999));
	const columns = $derived(
		grain === "month" ? 12 : grain === "quarter" ? 4 : grain === "half" ? 2 : 1
	);

	function inputValue(timeframe: Timeframe) {
		if (timeframe.grain === "day") return timeframe.date;
		if (timeframe.grain === "month") return timeframe.date.slice(0, 7);
		return dateLabel(timeframe);
	}

	function reset() {
		const anchor = value ?? min ?? max;
		year = anchor ? parseDate(anchor.date).year : today(getLocalTimeZone()).year;
		grain = value && available.includes(value.grain) ? value.grain : available[0];
		typed = value ? inputValue(value) : "";
		error = "";
	}

	function outOfRange(next: Timeframe) {
		if (minDate && timeframeEnd(next).compare(minDate) < 0)
			return chinese
				? "日期不能早于最早可选日期。"
				: "Date cannot precede the earliest available date.";
		if (maxDate && parseDate(next.date).compare(maxDate) > 0)
			return chinese
				? "日期不能晚于最晚可选日期。"
				: "Date cannot follow the latest available date.";
		return "";
	}

	function commit(next: Timeframe | undefined) {
		value = next;
		onValueChange?.(next);
		open = false;
	}

	function choose(next: Timeframe) {
		error = outOfRange(next);
		if (!error) commit(next);
	}

	function chooseTyped(event: KeyboardEvent) {
		if (event.key !== "Enter" || event.isComposing) return;
		event.preventDefault();
		if (!typed.trim() && value && allowClear) {
			commit(undefined);
			return;
		}
		const result = inferTimeframe(typed, year);
		if (!result) error = chinese ? "请输入有效日期。" : "Enter a valid date.";
		else if (!available.includes(result.grain))
			error = chinese ? "请选择允许的日期精度。" : "Choose an available date precision.";
		else choose(result);
	}

	function period(periodYear: number, index: number): Timeframe {
		return { date: new CalendarDate(periodYear, 1 + index * (12 / columns), 1).toString(), grain };
	}
</script>

<Popover.Root
	bind:open
	onOpenChange={(next) => {
		if (next) reset();
	}}
>
	<Popover.Trigger
		aria-label={label}
		aria-describedby={value ? valueId : undefined}
		data-slot="date-picker-trigger"
		class={cn(
			"inline-flex h-6 items-center gap-1 rounded-full border border-border bg-card px-2 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent",
			className
		)}
	>
		<IconPlaceholder
			lucide="CalendarIcon"
			tabler="IconCalendar"
			hugeicons="Calendar03Icon"
			phosphor="CalendarIcon"
			remixicon="RiCalendarLine"
			class="size-3.5"
			aria-hidden="true"
		/>
		{value ? dateLabel(value, locale) : placeholder}
	</Popover.Trigger>
	<Popover.Content
		appearance="surface"
		role="dialog"
		aria-label={label}
		{portalProps}
		data-slot="date-picker-content"
		sideOffset={5}
		align="start"
		class="cn-date-picker-content gap-0 pb-0"
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			input?.focus();
			input?.select();
		}}
	>
		<div class="grid shrink-0 gap-2">
			<div class="text-xs font-medium text-muted-foreground">{label}</div>
			<Input
				bind:ref={input}
				bind:value={typed}
				aria-label={chinese ? "输入日期" : "Enter date"}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? valueId + "-error" : undefined}
				placeholder={prompt}
				oninput={() => (error = "")}
				onkeydown={chooseTyped}
				class="cn-date-picker-input"
			/>
			{#if error}
				<p id={valueId + "-error"} role="alert" class="text-xs text-destructive">{error}</p>
			{/if}
		</div>
		{#if available.length > 1}
			<Tabs.Root
				value={grain}
				class="mt-3.5 min-w-0 shrink-0"
				onValueChange={(next) => {
					grain = next as Grain;
					typed = grain === value?.grain ? inputValue(value) : "";
					error = "";
				}}
			>
				<Tabs.List
					variant="capsule"
					aria-label={chinese ? "日期粒度" : "Date precision"}
					class="cn-date-picker-precision h-8 w-full"
				>
					{#each available as item (item)}
						<Tabs.Trigger value={item}>{labels[item][chinese ? 0 : 1]}</Tabs.Trigger>
					{/each}
				</Tabs.List>
				<Tabs.Content value={grain} class="min-w-0">
					{@render choices()}
				</Tabs.Content>
			</Tabs.Root>
		{:else}
			{@render choices()}
		{/if}
		{#if value && allowClear}
			<div class="flex shrink-0 justify-end border-t border-border py-2">
				<Button size="sm" variant="ghost" onclick={() => commit(undefined)}
					>{chinese ? "清除日期" : "Clear date"}</Button
				>
			</div>
		{/if}
	</Popover.Content>
</Popover.Root>
{#if value}<span id={valueId} class="sr-only">{dateLabel(value, locale)}</span>{/if}

{#snippet choices()}
	{#if grain === "day"}
		<Calendar
			type="single"
			appearance="project-date"
			calendarLabel={label}
			{locale}
			fixedWeeks
			value={value?.grain === "day" ? parseDate(value.date) : undefined}
			placeholder={value ? parseDate(value.date) : (minDate ?? maxDate)}
			minValue={minDate}
			maxValue={maxDate}
			onValueChange={(next) => {
				if (next) choose({ date: next.toString(), grain });
			}}
			class="mx-auto min-w-0"
		/>
	{:else}
		<div class="space-y-2 pb-2">
			<div class="flex justify-between">
				<Button
					size="sm"
					variant="ghost"
					disabled={year <= 1}
					onclick={() => (year = Math.max(1, year - 3))}
					aria-label={chinese ? "前几年" : "Previous years"}>‹</Button
				>
				<Button
					size="sm"
					variant="ghost"
					disabled={year + 2 >= 9999}
					onclick={() => (year += 3)}
					aria-label={chinese ? "后几年" : "Next years"}>›</Button
				>
			</div>
			{#each years as periodYear (periodYear)}
				<div class="space-y-1">
					{#if grain !== "year"}<div class="text-xs text-muted-foreground">{periodYear}</div>{/if}
					<div class={cn("grid gap-2", grain === "half" ? "grid-cols-2" : "grid-cols-4")}>
						{#each Array.from( { length: columns }, (_, index) => period(periodYear, index) ) as option, index (option.date)}
							<Button
								variant={value?.date === option.date && value.grain === grain
									? "secondary"
									: "outline"}
								shape="pill"
								size="xs"
								class="cn-date-picker-period"
								disabled={Boolean(outOfRange(option))}
								aria-label={dateLabel(option, locale)}
								aria-pressed={value?.date === option.date && value.grain === grain}
								onclick={() => choose(option)}
								>{grain === "month"
									? chinese
										? index + 1 + "月"
										: new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(
												parseDate(option.date).toDate("UTC")
											)
									: grain === "quarter"
										? "Q" + (index + 1)
										: grain === "half"
											? "H" + (index + 1)
											: periodYear}</Button
							>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}
