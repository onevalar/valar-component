<script lang="ts">
	import { Gauge, GaugeArc } from "$lib/registry/ui/gauge/index.js";
</script>

<div class="flex w-full max-w-md items-center gap-6">
	<Gauge value={72} label="配额" valueText="已使用 72%" class="w-32" />
	<Gauge value={125} label="超限配额" valueText="已使用 125%" tone="danger" class="w-32" />
	<svg viewBox="0 0 100 90" aria-hidden="true" class="w-24"><GaugeArc value={null} /></svg>
</div>
