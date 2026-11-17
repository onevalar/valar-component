<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { StaticSparkline } from "$lib/registry/ui/sparkline/index.js";

	const uid = $props.id();
	const weeklyTotals = [0, 3, 3, 5, 8, 11, 13];
	let hasGap = $state(false);
	const values = $derived(weeklyTotals.map((value, index) => (hasGap && index === 3 ? null : value)));
</script>

<figure
	aria-labelledby={`${uid}-completed`}
	class="grid w-full max-w-sm grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-[10px] border bg-card p-4"
>
	<figcaption id={`${uid}-completed`} class="text-sm font-medium">Completed</figcaption>
	<StaticSparkline {values} appearance="project" />
	<p class="col-span-2 text-xs text-muted-foreground" aria-live="polite">
		Weekly totals: {values.map((value) => value ?? "missing").join(", ")}
	</p>
	<div role="group" aria-label="Sample visibility" class="col-span-2 flex flex-wrap gap-2">
		<Button
			type="button"
			size="sm"
			variant="outline"
			aria-pressed={!hasGap}
			onclick={() => (hasGap = false)}>All weeks</Button
		>
		<Button
			type="button"
			size="sm"
			variant="outline"
			aria-pressed={hasGap}
			onclick={() => (hasGap = true)}>Missing week</Button
		>
	</div>
</figure>
