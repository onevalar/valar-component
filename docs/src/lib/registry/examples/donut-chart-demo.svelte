<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { StaticDonut, type DonutPart } from "$lib/registry/ui/donut-chart/index.js";
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const total = 120;
	const parts: DonutPart[] = [
		{ key: "completed", value: 60, color: "var(--chart-2)" },
		{ key: "in-progress", value: 24, color: "var(--muted-foreground)" }
	];
	const remaining = total - parts.reduce((sum, part) => sum + part.value, 0);
	const number = $derived(new Intl.NumberFormat(getLocale()));
	const ratio = $derived(new Intl.NumberFormat(getLocale(), { style: "percent" }));
</script>

{#snippet legendRow(label: string, value: number, color?: string)}
	<div class="grid grid-cols-[8px_minmax(0,1fr)_auto] items-baseline gap-2">
		<span
			aria-hidden="true"
			class="size-1.5 rounded-full"
			style:background={color ?? "color-mix(in oklab, var(--muted-foreground) 20%, transparent)"}
		></span>
		<dt class="text-muted-foreground [overflow-wrap:anywhere]">{label}</dt>
		<dd class="text-right tabular-nums">
			{number.format(value)} · {ratio.format(value / total)}
		</dd>
	</div>
{/snippet}

<div
	class="grid w-full max-w-[608px] grid-cols-[repeat(auto-fit,minmax(min(100%,264px),1fr))] gap-3"
>
	<figure
		class="flex flex-wrap items-center gap-4 rounded-[10px] border bg-card p-4 text-card-foreground"
	>
		<StaticDonut {parts} {total} class="size-[104px] shrink-0" />
		<figcaption class="min-w-0 flex-1 basis-28 space-y-2 text-[13px] leading-5">
			<p class="font-medium">{text("议题分布", "Issue breakdown")}</p>
			<dl class="space-y-1">
				{@render legendRow(text("已完成", "Completed"), parts[0].value, parts[0].color)}
				{@render legendRow(text("进行中", "In progress"), parts[1].value, parts[1].color)}
				{@render legendRow(text("未分配", "Unallocated"), remaining)}
			</dl>
			<p class="border-t pt-1 font-medium tabular-nums">
				{text("总量", "Total")} · {number.format(total)}
			</p>
		</figcaption>
	</figure>
	<figure
		class="flex flex-wrap items-center gap-4 rounded-[10px] border bg-card p-4 text-card-foreground"
	>
		<StaticDonut parts={[]} {total} class="size-[104px] shrink-0" />
		<figcaption class="min-w-0 flex-1 basis-28 space-y-2 text-[13px] leading-5">
			<p class="font-medium">{text("暂无分配", "No allocation yet")}</p>
			<p class="text-muted-foreground">
				{text("全部容量仍可分配。", "All capacity is still available.")}
			</p>
			<dl>{@render legendRow(text("未分配", "Unallocated"), total)}</dl>
		</figcaption>
	</figure>
</div>
