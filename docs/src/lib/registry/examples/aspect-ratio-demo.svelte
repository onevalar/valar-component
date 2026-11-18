<script lang="ts">
	import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";
</script>

<div class="w-full max-w-sm">
	<AspectRatio
		ratio={16 / 9}
		class="flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[10px] border-[0.5px] border-border bg-card shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
	>
		<div
			class="flex size-8 items-center justify-center rounded-[8px] border-[0.5px] border-border bg-muted/60"
			aria-hidden="true"
		>
			<div class="size-3.5 rounded-[3px] border border-primary/50 bg-primary/15"></div>
		</div>
		<span class="font-mono text-xs font-medium text-muted-foreground tabular-nums">16 : 9</span>
	</AspectRatio>
</div>
