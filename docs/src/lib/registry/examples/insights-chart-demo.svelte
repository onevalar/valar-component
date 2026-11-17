<script lang="ts">
	import { scaleBand } from "d3-scale";
	import { Chart as LayerChart } from "layerchart";
	import { tick } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Chart from "$lib/registry/ui/chart/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import * as Table from "$lib/registry/ui/table/index.js";
	import { cn } from "$lib/utils.js";

	const uid = $props.id();
	const priorities = ["none", "high", "medium", "low"] as const;
	type Priority = (typeof priorities)[number];

	const config = {
		none: { label: "No priority", color: "var(--insight-priority-none)" },
		high: { label: "High", color: "var(--insight-priority-high)" },
		medium: { label: "Medium", color: "var(--insight-priority-medium)" },
		low: { label: "Low", color: "var(--insight-priority-low)" }
	} satisfies Chart.ChartConfig;

	const groups = [
		{ id: "todo", status: "Todo", glyph: "border-current", none: 108, high: 11, medium: 20, low: 2 },
		{
			id: "in-progress", status: "In Progress",
			glyph: "border-amber-500 bg-[linear-gradient(90deg,var(--color-amber-500)_50%,transparent_50%)]",
			none: 42, high: 9, medium: 9, low: 1
		},
		{
			id: "review", status: "In Review",
			glyph: "border-amber-500 bg-[linear-gradient(90deg,var(--color-amber-500)_75%,transparent_75%)]",
			none: 8, high: 1, medium: 0, low: 1
		}
	].map((group) => ({
		...group,
		total: priorities.reduce((sum, priority) => sum + group[priority], 0)
	}));
	type Group = (typeof groups)[number];
	type Segment = { group: Group; priority: Priority };
	const series = [...priorities].reverse().map((key) => ({
		key,
		label: config[key].label,
		color: config[key].color,
		value: (group: Group) => group[key] || null
	}));
	const amounts = [0, 25, 50, 75, 100, 125, 150];
	const statusScale = scaleBand<string>();
	const sampleIssues = [
		"Review status transitions",
		"Check the issue queue",
		"Update team notes",
		"Review the next milestone",
		"Confirm list views",
		"Refine the planning draft"
	];
	const percentFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

	let hovered = $state.raw<Segment>();
	let selection = $state.raw<Segment>();
	let closeButton = $state<HTMLButtonElement | null>(null);
	const active = $derived(hovered ?? selection);

	function cellId({ group, priority }: Segment) {
		return `${uid}-${group.id}-${priority}`;
	}

	async function selectSegment(group: Group, priority: Priority) {
		if (!group[priority]) return;
		hovered = undefined;
		selection = { group, priority };
		await tick();
		closeButton?.focus();
	}

	async function closeDetail() {
		const cell = selection && cellId(selection);
		selection = undefined;
		await tick();
		if (cell) document.getElementById(cell)?.focus();
	}
</script>

{#snippet statusTick({ props, index }: { props: { x?: unknown; y?: unknown }; index: number })}
	{@const group = groups[index]}
	<foreignObject x={Number(props.x) - 44} y={Number(props.y) + 5} width="88" height="20">
		<div class="mx-auto flex max-w-[4rem] items-center justify-center gap-1 text-xs font-[450] text-muted-foreground @min-[400px]:max-w-none">
			<span aria-hidden="true" class={cn("size-3 shrink-0 rounded-full border", group.glyph)}></span>
			<span class="truncate">{group.status}</span>
		</div>
	</foreignObject>
{/snippet}

<section aria-label="Issue insights" class="w-full min-w-0 max-w-4xl @container">
	<div class={cn("grid min-w-0 gap-3", selection && "@min-[640px]:grid-cols-[minmax(0,1fr)_14rem]")}>
		<div class="min-w-0 space-y-3">
			<h3 class="text-sm font-medium">Issue count by status and priority</h3>
			<Chart.Container {config} appearance="insights" aria-hidden="true">
				<LayerChart
					data={groups}
					{series}
					x="status"
					xScale={statusScale}
					yDomain={[0, 150]}
					padding={{ top: 12, right: 30, bottom: 27, left: 0 }}
					rule={false}
					highlight={false}
					tooltipContext={{ mode: "manual" }}
					props={{
						xAxis: { tickMarks: false, ticks: groups.map(({ status }) => status), tickLabel: statusTick },
						yAxis: { placement: "right", tickMarks: false, ticks: amounts },
						grid: { y: { stroke: "var(--border)", dashArray: [4, 4] }, yTicks: amounts }
					}}
				>
					{#snippet marks({ context })}
						{#each groups as group (group.id)}
							{#each priorities as priority, index (priority)}
								{@const count = group[priority]}
								{#if count > 0}
									{@const start = priorities.slice(0, index).reduce((sum, key) => sum + group[key], 0)}
									{@const x = (context.xScale(group.status) ?? 0) + (context.xScale.bandwidth?.() ?? 0) / 2 - 5}
									{@const y = context.yScale(start + count)}
									<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (each graphic has the equivalent keyboard-accessible table button) -->
									<rect
										{x}
										{y}
										width="10"
										height={context.yScale(start) - y}
										fill={config[priority].color}
										opacity={active && active.group !== group ? 0.28 : 1}
										class="cursor-pointer"
										data-insights-mark={`${group.id}-${priority}`}
										onpointermove={(event) => {
											hovered = { group, priority };
											context.tooltip.show(event, group);
										}}
										onpointerleave={() => {
											hovered = undefined;
											context.tooltip.hide();
										}}
										onclick={() => {
											context.tooltip.hide();
											void selectSegment(group, priority);
										}}
									/>
								{/if}
							{/each}
						{/each}
					{/snippet}
					{#snippet tooltip()}
						<Chart.Tooltip appearance="insights" hideLabel>
							{#snippet formatter({ value, name, item, payload })}
								{@const total = payload.reduce((sum, row) => sum + Number(row.value), 0)}
								<div
									class={cn(
										"grid w-full grid-cols-[minmax(0,1fr)_auto_3.5em] items-center gap-x-1.5 leading-[14.5px]",
										hovered?.priority !== item.key && "opacity-65"
									)}
								>
									<span class="flex min-w-0 items-center gap-1.5">
										<span
											data-insights-swatch={item.key}
											class="size-1.5 shrink-0"
											style:background-color={item.color}
										></span>
										<span class="truncate">{name}</span>
									</span>
									<span class="text-end tabular-nums">{String(value)}</span>
									<span class="text-end text-[lch(40%_1_282)] tabular-nums dark:text-[lch(63.304%_1.425_272)]">
										{percentFormat.format(100 * Number(value) / total)}%
									</span>
								</div>
							{/snippet}
						</Chart.Tooltip>
					{/snippet}
				</LayerChart>
			</Chart.Container>

			<Table.Root
				aria-label="Issue counts by status and priority"
				scroll="overlay"
				scrollLabel="Scroll insight counts"
				class="min-w-[400px] text-xs"
			>
				<Table.Header>
					<Table.Row>
						<Table.Head scope="col">Priority</Table.Head>
						{#each groups as group (group.id)}
							<Table.Head scope="col" class="text-end">{group.status}</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each priorities as priority (priority)}
						<Table.Row>
							<th scope="row" class="px-2 text-start font-medium">{config[priority].label}</th>
							{#each groups as group (group.id)}
								<Table.Cell class="text-end tabular-nums" data-active={active?.group === group && active.priority === priority || undefined}>
									{#if group[priority]}
										<Button
											id={cellId({ group, priority })}
											size="xs"
											variant="ghost"
											aria-label={`${group.status} · ${config[priority].label}: ${group[priority]} issues`}
											aria-expanded={selection?.group === group && selection.priority === priority}
											aria-controls={selection ? `${uid}-insight-detail` : undefined}
											class={active?.group === group && active.priority === priority ? "bg-accent" : undefined}
											onclick={() => selectSegment(group, priority)}
										>
											{group[priority]}
										</Button>
									{:else}
										<span class="px-2.5 text-muted-foreground">0</span>
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<th scope="row" class="px-2 text-start font-medium">Total</th>
						{#each groups as group (group.id)}
							<Table.Cell class="text-end tabular-nums">{group.total}</Table.Cell>
						{/each}
					</Table.Row>
				</Table.Footer>
			</Table.Root>
		</div>

		{#if selection}
			<aside
				id={`${uid}-insight-detail`}
				aria-labelledby={`${uid}-detail-title`}
				class="min-w-0 self-start rounded-lg border bg-background"
			>
				<div class="flex flex-wrap items-center justify-between gap-2 border-b p-3">
					<h4 id={`${uid}-detail-title`} class="text-xs font-medium">
						{selection.group.status} · {config[selection.priority].label}
					</h4>
					<Button bind:ref={closeButton} size="xs" variant="outline" onclick={closeDetail}>
						Close panel
					</Button>
					<p class="w-full text-xs text-muted-foreground">
						{selection.group[selection.priority]} matching issues in the sample counts.
					</p>
				</div>
				<ScrollArea.Root
					appearance="settings"
					class="min-w-0"
					viewportLabel="Matching issue preview"
					viewportProps={{ class: "max-h-40" }}
				>
					<ul class="divide-y text-xs">
						{#each sampleIssues.slice(0, selection.group[selection.priority]) as issue (issue)}
							<li class="px-3 py-2">{issue}</li>
						{/each}
					</ul>
				</ScrollArea.Root>
			</aside>
		{/if}
	</div>
</section>
