<script lang="ts">
	import { scaleBand } from "d3-scale";
	import { BarChart, LineChart } from "layerchart";
	import * as Chart from "$lib/registry/ui/chart/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { CHART_SPEC } from "./chart-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	type Pane = "current" | "before";
	const id = $props.id();
	let states = $state({
		current: { kind: "bar" as "bar" | "line" },
		before: { kind: "bar" as "bar" | "line" },
	});
	const data = [
		{ month: 1, desktop: 186, mobile: 80 },
		{ month: 2, desktop: 305, mobile: 200 },
		{ month: 3, desktop: 237, mobile: 120 },
		{ month: 4, desktop: 73, mobile: 190 },
		{ month: 5, desktop: 209, mobile: 130 },
		{ month: 6, desktop: 214, mobile: 140 },
	];
	const config = {
		desktop: { label: "桌面访问", color: "var(--chart-1)" },
		mobile: { label: "移动访问", color: "var(--chart-2)" },
	} satisfies Chart.ChartConfig;
	const series = [
		{ key: "desktop", label: config.desktop.label, color: config.desktop.color },
		{ key: "mobile", label: config.mobile.label, color: config.mobile.color },
	];
	const monthLabel = (month: number) => `${month}月`;
</script>

{#snippet canvas(pane: Pane)}
	<section class="grid min-w-0 gap-4 p-4 md:p-6" aria-labelledby={`${id}-${pane}-heading`}>
		<h3 id={`${id}-${pane}-heading`} class="text-sm font-medium">一月至六月访问量</h3>
		<p id={`${id}-${pane}-instructions`} class="text-xs text-muted-foreground">
			悬停图表查看真实 LayerChart 提示框；只调外层留白和标题／系列区间距，内部系列行距保持不变。
			数值以默认 4px 间距刻度计，跟随全局 --spacing 缩放。
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<label for={`${id}-${pane}-kind`} class="text-sm">图表类型（仅预览）</label>
			<select
				id={`${id}-${pane}-kind`}
				class="rounded-md border bg-background px-2 py-1 text-sm"
				bind:value={states[pane].kind}
			>
				<option value="bar">柱状图</option>
				<option value="line">折线图</option>
			</select>
		</div>
		<!-- Keep the real portal and chart color variables inside this pane. Never add this
		     target to the ordinary page sample, or unrelated charts could use its fallback. -->
		{#key states[pane].kind}
			<Chart.Container
				{config}
				class="PortalTarget aspect-auto h-64 w-full"
				aria-labelledby={`${id}-${pane}-heading`}
				aria-describedby={`${id}-${pane}-instructions ${id}-${pane}-summary`}
			>
				{#if states[pane].kind === "bar"}
					<BarChart
						{data}
						x="month"
						xScale={scaleBand().padding(0.25)}
						{series}
						seriesLayout="group"
						legend
						axis="x"
						rule={false}
						grid={false}
						props={{ xAxis: { format: monthLabel } }}
					>
						{#snippet tooltip()}
							<Chart.Tooltip labelFormatter={monthLabel} />
						{/snippet}
					</BarChart>
				{:else}
					<LineChart
						{data}
						x="month"
						{series}
						legend
						axis="x"
						props={{ xAxis: { format: monthLabel, ticks: data.map((row) => row.month) } }}
					>
						{#snippet tooltip()}
							<Chart.Tooltip labelFormatter={monthLabel} />
						{/snippet}
					</LineChart>
				{/if}
			</Chart.Container>
		{/key}
		<p id={`${id}-${pane}-summary`} class="text-sm">
			六月桌面访问 214 次、移动访问 140 次；桌面访问最高为二月的 305 次。
		</p>
		<p class="text-xs text-muted-foreground">
			图例可用 Tab 聚焦、Enter 或空格选择系列；点位提示不提供键盘逐点导航，精确数据见下表。
			切换类型会重置该图的图例选择，不影响另一侧。
		</p>
		<div class="min-w-0 overflow-x-auto">
			<table class="w-full text-left text-sm">
				<caption class="mb-2 text-left text-xs text-muted-foreground">
					一月至六月全部系列数据（访问次数，不随图例选择隐藏）
				</caption>
				<thead>
					<tr class="border-b">
						<th scope="col" class="px-2 py-1">月份</th>
						<th scope="col" class="px-2 py-1">{config.desktop.label}</th>
						<th scope="col" class="px-2 py-1">{config.mobile.label}</th>
					</tr>
				</thead>
				<tbody>
					{#each data as row (row.month)}
						<tr class="border-b">
							<th scope="row" class="px-2 py-1 font-normal">{monthLabel(row.month)}</th>
							<td class="px-2 py-1 tabular-nums">{row.desktop}</td>
							<td class="px-2 py-1 tabular-nums">{row.mobile}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/snippet}

<ComponentTuner spec={CHART_SPEC} {canvas}>{@render children()}</ComponentTuner>
