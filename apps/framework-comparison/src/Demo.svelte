<script lang="ts">
	import * as Chart from "@valar/svelte-ui/chart";
	import * as Dialog from "@valar/svelte-ui/dialog";
	import * as Select from "@valar/svelte-ui/select";
	import { parseDate } from "@internationalized/date";
	import { Button } from "@valar/svelte-ui/button";
	import { Calendar } from "@valar/svelte-ui/calendar";
	import { Checkbox } from "@valar/svelte-ui/checkbox";
	import { Input } from "@valar/svelte-ui/input";
	import { RangeCalendar } from "@valar/svelte-ui/range-calendar";
	import { Slider } from "@valar/svelte-ui/slider";
	import { curveLinear } from "d3-shape";
	import { LineChart } from "layerchart";
	import { onMount } from "svelte";
	import { fixture } from "../../../standards/comparisons/frameworks/fixtures.ts";
	import { reportReady } from "../../../standards/comparisons/frameworks/ready.ts";

	const disabled = new URLSearchParams(location.search).get("disabled") === "1";
	let ready = $state(false);
	let count = $state(0);
	let name = $state("");
	let agree = $state(false);
	let provider = $state("claude");
	let value = $state(fixture.slider.initial);
	let date = $state(parseDate(fixture.date));
	let month = $state(parseDate(fixture.month));
	let rangeMonth = $state(parseDate(fixture.month));
	let range = $state({ start: parseDate(fixture.range.start), end: parseDate(fixture.range.end) });
	let result = $state("{}");
	let generation = $state(0);
	const chartData = fixture.chart.map((point, index) => ({ ...point, index }));
	const chartConfig = {
		value: { label: "用量", color: "var(--chart-2)" },
	} satisfies Chart.ChartConfig;

	onMount(() => {
		ready = true;
		reportReady("svelte");
	});
	function reset() {
		count = 0;
		name = "";
		agree = false;
		provider = "claude";
		value = fixture.slider.initial;
		date = parseDate(fixture.date);
		month = parseDate(fixture.month);
		rangeMonth = parseDate(fixture.month);
		range = { start: parseDate(fixture.range.start), end: parseDate(fixture.range.end) };
		result = "{}";
		generation++;
	}
</script>

<main class="first-batch-demo" data-framework="svelte" data-ready={ready}>
	<h1>Valar First Batch</h1>
	<form
		onsubmit={(event) => {
			event.preventDefault();
			result = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
		}}
		onreset={reset}
	>
		{#key generation}
			<div class="grid gap-6">
				<section class="demo-section" data-demo="button">
					<h2>Button</h2>
					<div class="demo-row">
						<Button {disabled} onclick={() => count++}>保存</Button>
						<Button variant="outline" {disabled}>次要操作</Button>
						<Button size="icon" aria-label="添加" {disabled}>＋</Button>
						<Button shape="pill" variant="secondary" {disabled}>胶囊按钮</Button>
					</div>
					<output class="demo-result" data-result="button">{count}</output>
				</section>
				<section class="demo-section" data-demo="input">
					<h2>Input</h2>
					<label class="demo-field">名称<Input name="name" bind:value={name} {disabled} /></label>
				</section>
				<section class="demo-section" data-demo="checkbox">
					<h2>Checkbox</h2>
					<label class="demo-row"
						><Checkbox name="agree" bind:checked={agree} {disabled} />同意</label
					>
				</section>
				<section class="demo-section" data-demo="select">
					<h2>Select</h2>
					<div class="demo-field">
						<label for="provider">服务商</label>
						<Select.Root
							type="single"
							bind:value={provider}
							items={fixture.options}
							name="provider"
							{disabled}
						>
							<Select.Trigger id="provider"><Select.Value /></Select.Trigger>
							<Select.Content
								>{#each fixture.options as option (option.value)}<Select.Item
										value={option.value}
										label={option.label}>{option.label}</Select.Item
									>{/each}</Select.Content
							>
						</Select.Root>
					</div>
					<output class="demo-result" data-result="select">{provider}</output>
				</section>
				<section class="demo-section" data-demo="dialog">
					<h2>Dialog</h2>
					<Dialog.Root>
						<Dialog.Trigger {disabled}
							>{#snippet child({ props })}<Button variant="outline" {...props}>打开弹窗</Button
								>{/snippet}</Dialog.Trigger
						>
						<Dialog.Content closeLabel="关闭">
							<Dialog.Header
								><Dialog.Title>编辑设置</Dialog.Title><Dialog.Description
									>更新名称。</Dialog.Description
								></Dialog.Header
							>
							<label class="demo-field">名称<Input aria-label="名称" /></label>
						</Dialog.Content>
					</Dialog.Root>
				</section>
				<section class="demo-section" data-demo="calendar">
					<h2>Calendar</h2>
					<Calendar
						type="single"
						bind:value={date}
						bind:placeholder={month}
						captionLayout="dropdown"
						{disabled}
					/>
					<output class="demo-result" data-result="calendar">{date?.toString() ?? ""}</output>
				</section>
				<section class="demo-section" data-demo="range-calendar">
					<h2>RangeCalendar</h2>
					<RangeCalendar
						bind:value={range}
						bind:placeholder={rangeMonth}
						captionLayout="dropdown"
						{disabled}
					/>
					<output class="demo-result" data-result="range-calendar"
						>{range.start?.toString() ?? ""} – {range.end?.toString() ?? ""}</output
					>
				</section>
				<section class="demo-section" data-demo="slider">
					<h2>Slider</h2>
					<div class="demo-field">
						<span id="quota-label">额度</span>
						<Slider
							type="single"
							bind:value
							min={fixture.slider.min}
							max={fixture.slider.max}
							step={fixture.slider.step}
							largeStep={fixture.slider.largeStep}
							aria-labelledby="quota-label"
							{disabled}
						/>
					</div>
					<!-- Bits Slider has no name API; the consumer explicitly serializes its controlled value. -->
					<input type="hidden" name="quota" {value} {disabled} />
					<output class="demo-result" data-result="slider">{value}</output>
				</section>
				<section class="demo-section" data-demo="chart">
					<h2>Chart</h2>
					<Chart.Container config={chartConfig} class="demo-chart">
						<LineChart
							data={chartData}
							x="index"
							yDomain={[0, 40]}
							points={{ r: 3 }}
							series={[{ key: "value", label: "用量", color: chartConfig.value.color }]}
							props={{
								spline: { curve: curveLinear, motion: "none", strokeWidth: 2 },
								xAxis: {
									ticks: chartData.map((point) => point.index),
									format: (index: number) => fixture.chart[index]?.label ?? "",
								},
							}}
						>
							{#snippet tooltip()}<Chart.Tooltip hideLabel />{/snippet}
						</LineChart>
					</Chart.Container>
				</section>
				<div class="demo-form-actions">
					<Button type="submit" {disabled}>提交</Button><Button type="reset" variant="outline"
						>重置</Button
					>
				</div>
				<output class="demo-result" data-result="form">{result}</output>
			</div>
		{/key}
	</form>
</main>
