<script lang="ts">
	import { Gauge, GaugeArc } from "$lib/registry/ui/gauge/index.js";
</script>

<div
	class="flex w-full max-w-md flex-wrap items-center gap-6 rounded-[10px] border-[0.5px] border-border bg-card px-5 py-4 shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
>
	<Gauge value={72} label="配额" valueText="已使用 72%" class="w-28" />
	<Gauge value={125} label="超限配额" valueText="已使用 125%" tone="danger" class="w-28" />
	<svg viewBox="0 0 100 90" aria-hidden="true" class="w-22"><GaugeArc value={null} /></svg>
</div>
