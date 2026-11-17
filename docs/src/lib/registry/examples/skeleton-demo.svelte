<script lang="ts">
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
</script>

<div class="flex w-full max-w-[314px] items-center gap-4" aria-busy="true">
	<Skeleton class="size-12 shrink-0 rounded-full" />
	<div class="min-w-0 flex-1 space-y-2">
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-4/5" />
	</div>
</div>
