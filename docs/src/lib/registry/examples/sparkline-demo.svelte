<script lang="ts">
	import { StaticSparkline } from "$lib/registry/ui/sparkline/index.js";
</script>

<div class="flex items-center gap-3">
	<StaticSparkline values={[0, 3, 2, null, 4, 8, 6]} width="144" height="80" />
	<p class="text-sm text-muted-foreground">七天记录：0、3、2、缺失、4、8、6</p>
</div>
