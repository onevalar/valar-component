<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { Gauge } from "$lib/registry/ui/gauge/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const usageText = (value: number) => text(`使用容量的 ${value}%`, `${value}% of capacity`);
	let value = $state(0);
</script>

<div class="grid w-full max-w-xs min-w-0 gap-4">
	<div class="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
		<span class="min-w-0 text-[13px] font-medium wrap-anywhere"
			>{text("迭代容量", "Cycle capacity")}</span
		>
		<Gauge
			appearance="capacity"
			{value}
			label={text("迭代容量用量", "Cycle capacity used")}
			valueText={usageText(value)}
			suffix={text("容量用量", "of capacity")}
		/>
	</div>
	<Slider
		type="single"
		bind:value
		min={0}
		max={125}
		step={25}
		aria-label={text("调节演示容量用量", "Adjust cycle capacity")}
	/>
	<div class="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-3">
		<span class="min-w-0 text-[13px] font-medium wrap-anywhere"
			>{text("超限示例", "Over capacity")}</span
		>
		<Gauge
			appearance="capacity"
			value={21100}
			label={text("超限迭代容量", "Over-capacity cycle")}
			valueText={usageText(21100)}
			suffix={text("容量用量", "of capacity")}
		/>
	</div>
</div>
