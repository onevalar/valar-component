<script lang="ts">
	import { TickMeter } from "$lib/registry/ui/tick-meter/index.js";
</script>

<div class="flex gap-6">
	<TickMeter value={50} label="配额" valueText="已使用 50%" class="w-32" />
	<TickMeter value={125} label="超限配额" valueText="已使用 125%" tone="danger" class="w-32" />
</div>
