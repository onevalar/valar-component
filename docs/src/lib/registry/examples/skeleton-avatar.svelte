<script lang="ts">
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
</script>

<div class="flex w-full max-w-[206px] items-center gap-4" aria-busy="true">
	<Skeleton class="size-10 shrink-0 rounded-full" />
	<div class="grid min-w-0 flex-1 gap-2">
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-2/3" />
	</div>
</div>
