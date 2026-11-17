<script lang="ts">
	import { scaleUtc } from "d3-scale";
	import { Chart as LayerChart } from "layerchart";
	import * as Chart from "$lib/registry/ui/chart/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";

	const periods = [
		{ value: "30", label: "Last 30 days" },
		{ value: "90", label: "Last 90 days" }
	];
	const sampleEnd = Date.UTC(2026, 10, 17);
	const dayLength = 86_400_000;
	const amounts = [0, 0.2, 0.4, 0.6, 0.8, 1];
	const dateFormat = new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		timeZone: "UTC"
	});
	const config = {
		usage: { label: "AI credit usage", color: "var(--chart-1)" }
	} satisfies Chart.ChartConfig;

	let period = $state("30");
	const start = $derived(new Date(sampleEnd - (Number(period) - 1) * dayLength));
	const end = new Date(sampleEnd);
</script>

<section aria-label="AI credit usage" class="flex w-full min-w-0 max-w-4xl flex-col gap-3">
	<div class="flex min-w-0 flex-wrap items-center justify-between gap-2">
		<h3 class="text-sm font-medium">Usage</h3>
		<Select.Root type="single" items={periods} bind:value={period}>
			<Select.Trigger size="sm" aria-label="Usage period">
				<Select.Value />
			</Select.Trigger>
			<Select.Content aria-label="Usage periods">
				{#each periods as option (option.value)}
					<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<Chart.Container {config} appearance="usage" aria-hidden="true">
		<LayerChart
			xScale={scaleUtc()}
			xDomain={[start, end]}
			yDomain={[0, 1]}
			padding={{ top: 12, right: 36, bottom: 28, left: 14 }}
			rule={false}
			highlight={false}
			tooltipContext={false}
			props={{
				xAxis: { format: (date: Date) => dateFormat.format(date), tickMarks: false },
				yAxis: {
					placement: "right",
					ticks: amounts,
					format: (amount: number) => `$${amount}`,
					tickMarks: false
				},
				grid: { y: { stroke: "var(--border)", dashArray: [4, 4] }, yTicks: amounts }
			}}
		/>
	</Chart.Container>

	<p role="status" class="text-xs text-muted-foreground">
		No usage in this period ({dateFormat.format(start)}–{dateFormat.format(end)}). Total $0.
	</p>
</section>
