<script lang="ts">
	import { CalendarDate, type DateValue } from "@internationalized/date";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Calendar } from "$lib/registry/ui/calendar/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { CALENDAR_SPEC } from "./calendar-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const date = new CalendarDate(2026, 11, 12);
	let widths = $state({ current: 0, before: 0 });
	let states = $state({
		current: {
			single: date as DateValue | undefined,
			multiple: [date, date.add({ days: 3 })] as DateValue[],
			locale: "zh-CN",
			caption: "dropdown" as "dropdown" | "label",
			bounded: true,
			disabled: false,
			multi: true,
		},
		before: {
			single: date as DateValue | undefined,
			multiple: [date, date.add({ days: 3 })] as DateValue[],
			locale: "zh-CN",
			caption: "dropdown" as "dropdown" | "label",
			bounded: true,
			disabled: false,
			multi: true,
		},
	});
	const unavailable = (value: DateValue) => value.day === 18;
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="calendar-canvas grid min-w-0 gap-5 p-2" bind:clientWidth={widths[pane]}>
		<p class="text-xs text-muted-foreground">
			真实单选／多选；方向键移动、Enter选择。边界为11月5日至12月24日，18日不可选。月数按当前画布宽度减少，不按浏览器宽度挤压。
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
		<section
			class="grid min-w-0 justify-items-start gap-2"
			aria-labelledby={`${id}-${pane}-single`}
		>
			<h3 id={`${id}-${pane}-single`} class="text-sm">单个日期</h3>
			<Calendar
				type="single"
				bind:value={states[pane].single}
				placeholder={date}
				locale={states[pane].locale}
				captionLayout={states[pane].caption}
				weekStartsOn={1}
				numberOfMonths={states[pane].multi && widths[pane] >= 640 ? 2 : 1}
				minValue={states[pane].bounded ? new CalendarDate(2026, 11, 5) : undefined}
				maxValue={states[pane].bounded ? new CalendarDate(2026, 12, 24) : undefined}
				isDateDisabled={unavailable}
				disabled={states[pane].disabled}
				aria-labelledby={`${id}-${pane}-single`}
			/>
			<output class="text-xs text-muted-foreground" aria-live="polite"
				>已选：{states[pane].single?.toString() ?? "未选择"}</output
			>
		</section>
		<section
			class="grid min-w-0 justify-items-start gap-2"
			aria-labelledby={`${id}-${pane}-multiple`}
		>
			<h3 id={`${id}-${pane}-multiple`} class="text-sm">多个独立日期</h3>
			<Calendar
				type="multiple"
				bind:value={states[pane].multiple}
				placeholder={date}
				locale={states[pane].locale}
				captionLayout={states[pane].caption}
				weekStartsOn={1}
				minValue={states[pane].bounded ? new CalendarDate(2026, 11, 5) : undefined}
				maxValue={states[pane].bounded ? new CalendarDate(2026, 12, 24) : undefined}
				isDateDisabled={unavailable}
				disabled={states[pane].disabled}
				aria-labelledby={`${id}-${pane}-multiple`}
			/>
			<output class="text-xs break-words text-muted-foreground" aria-live="polite"
				>已选：{states[pane].multiple.map((value) => value.toString()).join("、") ||
					"未选择"}</output
			>
		</section>
		<Button
			class="justify-self-start"
			variant="outline"
			onclick={() => {
				states[pane].single = undefined;
				states[pane].multiple = [];
			}}>清空当前画布日期</Button
		>
	</div>
{/snippet}

<ComponentTuner spec={CALENDAR_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	/* The source uses viewport md:flex-row; the tuner must use its own pane width instead. */
	.calendar-canvas :global([data-slot="calendar"] > div) {
		flex-direction: row;
	}
</style>
