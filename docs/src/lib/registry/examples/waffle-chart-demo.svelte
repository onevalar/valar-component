<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { WaffleChart } from "$lib/registry/ui/waffle-chart/index.js";
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const data = [
		{ key: "feature", value: 646, color: "var(--chart-2)" },
		{ key: "maintenance", value: 354, color: "var(--muted-foreground)" }
	];
	const total = data.reduce((sum, category) => sum + category.value, 0);
	const number = $derived(new Intl.NumberFormat(getLocale()));
	const ratio = $derived(
		new Intl.NumberFormat(getLocale(), {
			style: "percent",
			maximumFractionDigits: 1
		})
	);
</script>

<div
	class="grid w-full max-w-[608px] grid-cols-[repeat(auto-fit,minmax(min(100%,264px),1fr))] gap-3"
>
	<figure
		class="flex flex-wrap items-center gap-4 rounded-[10px] border bg-card p-4 text-card-foreground"
	>
		<WaffleChart
			{data}
			label={text("一百个格子表示议题占比", "Issue proportions in a hundred cells")}
			class="size-[104px] shrink-0"
		/>
		<figcaption class="min-w-0 flex-1 basis-28 space-y-2 text-[13px] leading-5">
			<p class="font-medium">{text("议题构成", "Issue composition")}</p>
			<dl class="space-y-1">
				{#each data as category (category.key)}
					<div class="grid grid-cols-[8px_minmax(0,1fr)_auto] items-baseline gap-2">
						<span aria-hidden="true" class="size-1.5 rounded-full" style:background={category.color}
						></span>
						<dt class="text-muted-foreground [overflow-wrap:anywhere]">
							{category.key === "feature"
								? text("产品功能", "Features")
								: text("技术维护", "Maintenance")}
						</dt>
						<dd class="text-right tabular-nums">
							{number.format(category.value)} · {ratio.format(category.value / total)}
						</dd>
					</div>
				{/each}
			</dl>
			<p class="border-t pt-1 font-medium tabular-nums">
				{text("总量", "Total")} · {number.format(total)}
			</p>
		</figcaption>
	</figure>
	<figure
		class="flex flex-wrap items-center gap-4 rounded-[10px] border bg-card p-4 text-card-foreground"
	>
		<WaffleChart
			data={[]}
			label={text("没有议题可绘制", "No issues to plot")}
			class="size-[104px] shrink-0"
		/>
		<figcaption class="min-w-0 flex-1 basis-28 space-y-2 text-[13px] leading-5">
			<p class="font-medium">{text("暂无议题", "No issues yet")}</p>
			<p class="text-muted-foreground">
				{text(
					"有数据后会在这里显示构成。",
					"The breakdown will appear here when there are issues."
				)}
			</p>
		</figcaption>
	</figure>
</div>
