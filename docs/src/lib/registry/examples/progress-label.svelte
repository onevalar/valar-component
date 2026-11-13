<script lang="ts">
	import { Progress } from "$lib/registry/ui/progress/index.js";

	const labelId = $props.id();
</script>

<div class="grid w-full max-w-sm gap-2">
	<div class="flex items-center justify-between gap-2 text-[13px] font-medium">
		<span id={labelId}>Upload progress</span>
		<span aria-hidden="true" class="text-muted-foreground font-[450] tabular-nums">56%</span>
	</div>
	<Progress value={56} aria-labelledby={labelId} />
</div>
