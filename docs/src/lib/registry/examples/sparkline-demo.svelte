<script lang="ts">
	import { StaticSparkline } from "$lib/registry/ui/sparkline/index.js";
</script>

<div
	class="flex flex-wrap items-center gap-3 rounded-[10px] border-[0.5px] border-border bg-card px-4 py-3 shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
>
	<StaticSparkline values={[0, 3, 2, null, 4, 8, 6]} width="112" height="56" />
	<div class="grid gap-0.5">
		<span class="text-[13px] font-medium text-foreground">七天活跃趋势</span>
		<p class="text-xs text-muted-foreground tabular-nums">0 · 3 · 2 · 缺失 · 4 · 8 · 6</p>
	</div>
</div>
