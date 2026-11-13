<script lang="ts">
	import { DatePicker, type Timeframe } from "$lib/registry/ui/date-picker/index.js";

	let start = $state<Timeframe>();
	let target = $state<Timeframe>();
</script>

<div class="flex flex-wrap gap-2">
	<DatePicker label="Start date" max={target} bind:value={start} />
	<DatePicker label="Target date" min={start} bind:value={target} />
</div>
