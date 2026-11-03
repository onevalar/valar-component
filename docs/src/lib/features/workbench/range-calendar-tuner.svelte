<script lang="ts">
	import { CalendarDate, type DateValue } from "@internationalized/date";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { RANGE_CALENDAR_SPEC } from "./range-calendar-tuning.js";
	import type { DateRange } from "bits-ui";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const start = new CalendarDate(2026, 11, 12);
	let widths = $state({ current: 0, before: 0 });
	let states = $state({
		current: {
			value: { start, end: start.add({ days: 8 }) } as DateRange | undefined,
			locale: "zh-CN",
			caption: "dropdown" as "dropdown" | "label",
			bounded: true,
			disabled: false,
			multi: true,
		},
		before: {
			value: { start, end: start.add({ days: 8 }) } as DateRange | undefined,
			locale: "zh-CN",
			caption: "dropdown" as "dropdown" | "label",
			bounded: true,
			disabled: false,
			multi: true,
		},
	});
	const unavailable = (value: DateValue) => value.day === 25;
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="range-calendar-canvas grid min-w-0 gap-5 p-2" bind:clientWidth={widths[pane]}>
		<p class="text-xs text-muted-foreground">
			真实起止选择、范围中段与端点。边界为11月5日至12月24日，25日不可选。双月只在当前画布足够宽时显示；方向键与Enter仍由
			Bits UI 处理。
		</p>
		<div class="flex flex-wrap items-center gap-3 text-xs">
			<label for={`${id}-${pane}-locale`}
				>语言
				<select
					id={`${id}-${pane}-locale`}
					bind:value={states[pane].locale}
					class="rounded border bg-background p-1"
				>
					<option value="zh-CN">中文 · 公历</option><option value="en-US">English</option><option
						value="ar-EG">العربية</option
					>
				</select>
			</label>
			<label for={`${id}-${pane}-caption`}
				>标题
				<select
					id={`${id}-${pane}-caption`}
					bind:value={states[pane].caption}
					class="rounded border bg-background p-1"
				>
					<option value="dropdown">年月选择</option><option value="label">文字</option>
				</select>
			</label>
			<label><input type="checkbox" bind:checked={states[pane].bounded} /> 日期边界</label>
			<label><input type="checkbox" bind:checked={states[pane].disabled} /> 禁用</label>
			<label><input type="checkbox" bind:checked={states[pane].multi} /> 宽画布双月</label>
		</div>
		<section class="grid min-w-0 justify-items-start gap-3" aria-labelledby={`${id}-${pane}-range`}>
			<h3 id={`${id}-${pane}-range`} class="text-sm">预订日期范围</h3>
			<RangeCalendar
				bind:value={states[pane].value}
				placeholder={start}
				locale={states[pane].locale}
				captionLayout={states[pane].caption}
				weekStartsOn={1}
				numberOfMonths={states[pane].multi && widths[pane] >= 640 ? 2 : 1}
				minValue={states[pane].bounded ? new CalendarDate(2026, 11, 5) : undefined}
				maxValue={states[pane].bounded ? new CalendarDate(2026, 12, 24) : undefined}
				isDateDisabled={unavailable}
				disabled={states[pane].disabled}
				aria-labelledby={`${id}-${pane}-range`}
			/>
			<output aria-live="polite" class="text-xs text-muted-foreground"
				>{states[pane].value?.start?.toString() ?? "选择开始日期"} → {states[
					pane
				].value?.end?.toString() ?? "选择结束日期"}</output
			>
		</section>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" onclick={() => (states[pane].value = undefined)}
				>清空当前范围</Button
			>
			<Button
				variant="outline"
				onclick={() => (states[pane].value = { start, end: start.add({ days: 3 }) })}
				>四天预设</Button
			>
		</div>
	</div>
{/snippet}

<ComponentTuner spec={RANGE_CALENDAR_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.range-calendar-canvas :global([data-slot="range-calendar"] > div) {
		flex-direction: row;
	}
</style>
