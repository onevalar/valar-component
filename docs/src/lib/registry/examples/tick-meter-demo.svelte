<script lang="ts">
	import { TickMeter } from "$lib/registry/ui/tick-meter/index.js";
</script>

<div
	class="flex flex-wrap items-center gap-6 rounded-[10px] border-[0.5px] border-border bg-card px-5 py-4 shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
>
	<TickMeter value={50} label="配额" valueText="已使用 50%" class="w-28" />
	<TickMeter value={125} label="超限配额" valueText="已使用 125%" tone="danger" class="w-28" />
</div>
