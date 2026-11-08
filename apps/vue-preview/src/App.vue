<script setup lang="ts">
import { parseDate } from "@internationalized/date";
import { CurveType } from "@unovis/ts";
import { VisAxis, VisLine, VisScatter, VisXYContainer } from "@unovis/vue";
import { Button } from "@valar/vue-ui/button";
import { Calendar } from "@valar/vue-ui/calendar";
import {
	ChartContainer,
	ChartCrosshair,
	ChartTooltip,
	ChartTooltipContent,
	componentToString,
} from "@valar/vue-ui/chart";
import { Checkbox } from "@valar/vue-ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@valar/vue-ui/dialog";
import { Input } from "@valar/vue-ui/input";
import { RangeCalendar } from "@valar/vue-ui/range-calendar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/vue-ui/select";
import { Slider } from "@valar/vue-ui/slider";
import { computed, nextTick, onMounted, ref, shallowRef } from "vue";
import { fixture } from "../../../standards/comparisons/frameworks/fixtures";
import { reportReady } from "../../../standards/comparisons/frameworks/ready";
import type { ChartConfig } from "@valar/vue-ui/chart";

const disabled = new URLSearchParams(location.search).get("disabled") === "1";
const ready = ref(false);
const key = ref(0);
const count = ref(0);
const name = ref("");
const agree = ref(false);
const provider = ref("claude");
const amount = ref(fixture.slider.initial);
const date = shallowRef(parseDate(fixture.date));
const month = shallowRef(parseDate(fixture.month));
const range = shallowRef({
	start: parseDate(fixture.range.start),
	end: parseDate(fixture.range.end),
});
const rangeMonth = shallowRef(parseDate(fixture.month));
const submitted = ref("{}");
const rangeText = computed(
	() => `${range.value.start?.toString() ?? ""} – ${range.value.end?.toString() ?? ""}`
);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const chart = fixture.chart.map((datum, index) => ({
	...datum,
	x: index,
	y: datum.value === null ? Number.NaN : datum.value,
}));
type Datum = (typeof chart)[number];
const chartConfig = { value: { label: "用量", color: "var(--chart-2)" } } satisfies ChartConfig;
// Native upstream ChartLineExample/PowerUsage composition, not a demo renderer.
// Keep value:null in the payload; only the line accessor maps it to a NaN gap.
const tooltipTemplate = componentToString(chartConfig, ChartTooltipContent, { hideLabel: true });
const x = (datum: Datum) => datum.x;
const y = (datum: Datum) => datum.y;
function submit(event: Event) {
	submitted.value = JSON.stringify(
		Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement))
	);
}
async function reset() {
	// Keep the native reset event, then remount Reka/passive-input local state.
	await nextTick();
	count.value = 0;
	name.value = "";
	agree.value = false;
	provider.value = "claude";
	amount.value = fixture.slider.initial;
	date.value = parseDate(fixture.date);
	month.value = parseDate(fixture.month);
	range.value = { start: parseDate(fixture.range.start), end: parseDate(fixture.range.end) };
	rangeMonth.value = parseDate(fixture.month);
	submitted.value = "{}";
	key.value++;
}
onMounted(async () => {
	ready.value = true;
	await nextTick();
	reportReady("vue");
});
</script>

<template>
	<main class="first-batch-demo" data-framework="vue" :data-ready="ready ? 'true' : 'false'">
		<h1>Valar First Batch</h1>
		<form :key="key" class="grid gap-6" @submit.prevent="submit" @reset="reset">
			<section class="demo-section" data-demo="button">
				<h2>Button</h2>
				<div class="demo-row">
					<Button :disabled="disabled" @click="count++">保存</Button>
					<Button variant="outline" :disabled="disabled">次要操作</Button>
					<Button size="icon" aria-label="添加" :disabled="disabled">＋</Button>
					<Button variant="secondary" shape="pill" :disabled="disabled">胶囊按钮</Button>
				</div>
				<output class="demo-result" data-result="button">{{ count }}</output>
			</section>
			<section class="demo-section" data-demo="input">
				<h2>Input</h2>
				<div class="demo-field">
					<label for="name">名称</label
					><Input id="name" v-model="name" name="name" :disabled="disabled" />
				</div>
			</section>
			<section class="demo-section" data-demo="checkbox">
				<h2>Checkbox</h2>
				<div class="demo-row">
					<Checkbox id="agree" v-model="agree" name="agree" :disabled="disabled" /><label
						for="agree"
						>同意</label
					>
				</div>
			</section>
			<section class="demo-section" data-demo="select">
				<h2>Select</h2>
				<div class="demo-field">
					<label for="provider">服务商</label>
					<Select v-model="provider" name="provider" :disabled="disabled">
						<SelectTrigger id="provider"><SelectValue /></SelectTrigger>
						<SelectContent
							><SelectItem
								v-for="option in fixture.options"
								:key="option.value"
								:value="option.value"
								>{{ option.label }}</SelectItem
							></SelectContent
						>
					</Select>
				</div>
				<output class="demo-result" data-result="select">{{ provider }}</output>
			</section>
			<section class="demo-section" data-demo="dialog">
				<h2>Dialog</h2>
				<Dialog>
					<DialogTrigger as-child
						><Button variant="outline" :disabled="disabled">打开弹窗</Button></DialogTrigger
					>
					<DialogContent>
						<DialogHeader
							><DialogTitle>编辑设置</DialogTitle
							><DialogDescription>更新名称。</DialogDescription></DialogHeader
						>
						<div class="demo-field">
							<label for="dialog-name">名称</label><Input id="dialog-name" :disabled="disabled" />
						</div>
					</DialogContent>
				</Dialog>
			</section>
			<section class="demo-section" data-demo="calendar">
				<h2>Calendar</h2>
				<Calendar
					v-model="date"
					v-model:placeholder="month"
					caption-layout="dropdown"
					locale="zh-CN"
					:disabled="disabled"
				/>
				<output class="demo-result" data-result="calendar">{{ date?.toString() }}</output>
			</section>
			<section class="demo-section" data-demo="range-calendar">
				<h2>RangeCalendar</h2>
				<RangeCalendar
					v-model="range"
					v-model:placeholder="rangeMonth"
					caption-layout="dropdown"
					locale="zh-CN"
					:disabled="disabled"
				/>
				<output class="demo-result" data-result="range-calendar">{{ rangeText }}</output>
			</section>
			<section class="demo-section" data-demo="slider">
				<h2>Slider</h2>
				<div class="demo-field">
					<label id="amount-label">额度</label>
					<Slider
						v-model="amount"
						type="single"
						aria-labelledby="amount-label"
						:min="fixture.slider.min"
						:max="fixture.slider.max"
						:step="fixture.slider.step"
						:large-step="fixture.slider.largeStep"
						:disabled="disabled"
					/>
				</div>
				<!-- Explicit scalar serialization; native Reka name uses vector name[0]. -->
				<input type="hidden" name="quota" :value="amount" :disabled="disabled" />
				<output class="demo-result" data-result="slider">{{ amount }}</output>
			</section>
			<section class="demo-section" data-demo="chart">
				<h2>Chart</h2>
				<ChartContainer
					:config="chartConfig"
					class="demo-chart"
					role="img"
					aria-label="每周用量折线图，星期三数据缺失"
				>
					<VisXYContainer
						:data="chart"
						:height="220"
						:y-domain="[0, 40]"
						:duration="reducedMotion ? 0 : 300"
					>
						<VisLine
							:x="x"
							:y="y"
							:curve-type="CurveType.Linear"
							color="var(--chart-2)"
							:interpolate-missing-data="false"
						/>
						<VisScatter :x="x" :y="y" :size="6" color="var(--chart-2)" />
						<VisAxis
							type="x"
							:tick-values="[0, 1, 2, 3, 4, 5, 6]"
							:tick-format="(value: number) => fixture.chart[value]?.label ?? ''"
							:grid-line="false"
							:domain-line="false"
							:tick-line="false"
						/>
						<VisAxis
							type="y"
							:tick-values="[0, 10, 20, 30, 40]"
							:grid-line="true"
							:domain-line="false"
							:tick-line="false"
						/>
						<ChartTooltip />
						<ChartCrosshair :template="tooltipTemplate" color="var(--chart-2)" />
					</VisXYContainer>
				</ChartContainer>
			</section>
			<div class="demo-form-actions">
				<Button type="submit" :disabled="disabled">提交</Button
				><Button type="reset" variant="outline">重置</Button>
			</div>
			<output class="demo-result" data-result="form">{{ submitted }}</output>
		</form>
	</main>
</template>
